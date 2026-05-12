const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');
const db = require('./db.cjs');

const CSV_PATH = path.join(__dirname, '..', '..', 'Prediction Markets + Onchain - 2026-SystematicTrading-may12-2026.csv');

// Parse date from various formats
function parseDate(dateStr) {
    if (!dateStr) return null;
    
    // Clean up the string
    let original = dateStr.toString().trim();
    dateStr = original;
    
    // Extract date part before | or < or (
    dateStr = dateStr.split('|')[0].split('<')[0].split('(')[0].trim();
    
    // Handle "2026-02-24" or "2026-02-04" format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
    }
    
    // Handle "2025-02-06" format (typo year)
    const yearMatch = dateStr.match(/^(202\d)-(\d{2})-(\d{2})/);
    if (yearMatch) {
        return `2026-${yearMatch[2]}-${yearMatch[3]}`;
    }
    
    // Handle "Jan 26, 2026" or "Jan 26, 2026" format
    try {
        const date = new Date(dateStr);
        if (!isNaN(date.getTime()) && date.getFullYear() > 2020) {
            return date.toISOString().split('T')[0];
        }
    } catch (e) {}
    
    // Handle "Feb 1" or "Feb 1, 2026" format (assume 2026)
    const monthMap = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'may': '05', 'jun': '06',
        'jul': '07', 'aug': '08', 'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    
    // Match "Feb 1" or "Feb 1, 2026" or "Feb1" (with typo)
    const monthMatch = dateStr.toLowerCase().match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*(\d{1,2})/);
    if (monthMatch) {
        const month = monthMap[monthMatch[1]];
        const day = monthMatch[2].padStart(2, '0');
        return `2026-${month}-${day}`;
    }
    
    // Handle "2/6/2026" or "2/6/2026" format (M/D/YYYY)
    const usDateMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (usDateMatch) {
        const month = usDateMatch[1].padStart(2, '0');
        const day = usDateMatch[2].padStart(2, '0');
        return `${usDateMatch[3]}-${month}-${day}`;
    }
    
    // Handle "26/02/26" format (DD/MM/YY)
    const euroDateMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
    if (euroDateMatch) {
        const day = euroDateMatch[1].padStart(2, '0');
        const month = euroDateMatch[2].padStart(2, '0');
        const year = euroDateMatch[3].length === 2 ? '20' + euroDateMatch[3] : euroDateMatch[3];
        return `${year}-${month}-${day}`;
    }
    
    // Handle "2026−02−06" (with special unicode minus sign)
    const unicodeDate = dateStr.replace(/[−–—]/g, '-');
    if (/^\d{4}-\d{2}-\d{2}$/.test(unicodeDate)) {
        return unicodeDate;
    }
    
    // Handle "2026-02-04 WBG vs AL" format
    const prefixDateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
    if (prefixDateMatch) {
        return prefixDateMatch[1];
    }
    
    // Handle "2026-04-05/IG-TES" format
    const slashDateMatch = dateStr.match(/^(\d{4}-\d{2}-\d{2})/);
    if (slashDateMatch) {
        return slashDateMatch[1];
    }
    
    // Handle "2025-0207" typo format
    const typoDateMatch = dateStr.match(/^(202\d)-(\d{2})(\d{2})/);
    if (typoDateMatch) {
        return `2026-${typoDateMatch[2]}-${typoDateMatch[3]}`;
    }
    
    // Handle "Fe b1" typo (space in month)
    const typoMonthMatch = dateStr.toLowerCase().replace(/\s+/g, '').match(/^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)(\d{1,2})/);
    if (typoMonthMatch) {
        const month = monthMap[typoMonthMatch[1]];
        const day = typoMonthMatch[2].padStart(2, '0');
        return `2026-${month}-${day}`;
    }
    
    // Handle "2026−02−06ALMoneyline" (no space between date and text)
    const noSpaceMatch = dateStr.match(/^(\d{4})[−–—-](\d{2})[−–—-](\d{2})/);
    if (noSpaceMatch) {
        return `${noSpaceMatch[1]}-${noSpaceMatch[2]}-${noSpaceMatch[3]}`;
    }
    
    return null;
}

// Extract teams from match description
function extractTeams(description) {
    if (!description) return { team_a: null, team_b: null, bet_on: null };
    
    const desc = description.toString();
    
    // Common patterns: "BLG vs JDG", "TES vs WE", "T1 vs DK"
    // Also handle: "BLG vs TES<br>(Total Over 2.5)"
    const cleanDesc = desc.replace(/<[^>]+>/g, ' ').trim();
    
    // Try to find "X vs Y" pattern
    const vsMatch = cleanDesc.match(/([A-Za-z0-9\s\.]+)\s+(?:vs|VS|v\.s\.)\s+([A-Za-z0-9\s\.]+)/);
    if (vsMatch) {
        return {
            team_a: vsMatch[1].trim(),
            team_b: vsMatch[2].trim().split('(')[0].trim(),
            bet_on: null
        };
    }
    
    return { team_a: null, team_b: null, bet_on: null };
}

// Detect league from teams/description
function detectLeague(description, category) {
    const desc = (description || '').toLowerCase();
    const cat = (category || '').toLowerCase();
    
    if (cat.includes('lpl') || desc.includes('lpl')) return 'LPL';
    if (cat.includes('lck') || desc.includes('lck')) return 'LCK';
    if (cat.includes('lec') || desc.includes('lec')) return 'LEC';
    if (cat.includes('lcs') || desc.includes('lcs')) return 'LCS';
    if (cat.includes('ewc') || desc.includes('ewc')) return 'EWC';
    if (cat.includes('msi') || desc.includes('msi')) return 'MSI';
    if (cat.includes('worlds') || desc.includes('worlds')) return 'Worlds';
    
    // Detect by team names (common LPL/LCK teams)
    const lplTeams = ['blg', 'jdg', 'tes', 'wbg', 'al', 'ig', 'we', 'nip', 'lng', 'omg', 'tt', 'up', 'ra', 'fpx', 'rng'];
    const lckTeams = ['t1', 'gen.g', 'geng', 'dk', 'kt', 'hle', 'drx', 'brion', 'bro', 'ns', 'dnf', 'bnk', 'fearx', 'kdf', 'freecs'];
    
    for (const team of lplTeams) {
        if (desc.includes(team)) return 'LPL';
    }
    for (const team of lckTeams) {
        if (desc.includes(team)) return 'LCK';
    }
    
    return null;
}

// Parse numeric value, handling various formats
function parseNumber(val) {
    if (val === null || val === undefined || val === '') return null;
    
    // Handle percentage strings like "19.40%"
    if (typeof val === 'string') {
        const cleaned = val.replace(/[%$¢,]/g, '').trim();
        const num = parseFloat(cleaned);
        return isNaN(num) ? null : num;
    }
    
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
}

// Parse the CSV and import bets
async function importBets() {
    try {
        console.log('Reading CSV file...');
        const fileContent = fs.readFileSync(CSV_PATH, 'utf8');
        
        // Parse CSV
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            relax_column_count: true
        });
        
        console.log(`Found ${records.length} records`);
        
        // Connect to database
        await db.connect();
        await db.initSchema();
        
        let imported = 0;
        let skipped = 0;
        
        for (const record of records) {
            // Skip non-LoL bets (check category/description)
            const category = (record['Category'] || '').toLowerCase();
            const description = (record['Date'] || '').toLowerCase();
            
            // Skip if clearly not LoL
            const isLoL = category.includes('lpl') || category.includes('lck') || 
                         category.includes('esports') || category.includes('lol') ||
                         description.includes('blg') || description.includes('t1') ||
                         description.includes('jdg') || description.includes('gen.g') ||
                         description.includes('tes') || description.includes('dk') ||
                         description.includes('drx') || description.includes('kt') ||
                         description.includes('hle') || description.includes('wbg');
            
            if (!isLoL) {
                skipped++;
                continue;
            }
            
            // Parse date
            const date = parseDate(record['Date']);
            if (!date) {
                console.log(`Skipping record with unparsable date: ${record['Date']}`);
                skipped++;
                continue;
            }
            
            // Extract teams
            const teams = extractTeams(record['Date']);
            
            // Detect league
            const league = detectLeague(record['Date'], record['Category']);
            
            // Parse outcome
            let outcome = record['Outcome']?.toString().toUpperCase();
            if (outcome === 'WIN' || outcome === 'W') outcome = 'WIN';
            else if (outcome === 'LOSS' || outcome === 'L' || outcome === 'LOSS,' || outcome === 'LOSS,-') outcome = 'LOSS';
            else if (outcome === 'PENDING' || outcome === 'TBD' || outcome === 'OPEN') outcome = 'PENDING';
            else if (outcome === 'SKIP' || outcome === 'STINK BID') outcome = 'SKIP';
            
            // Build bet object
            const bet = {
                date: date,
                match_description: record['Date']?.toString().split('|')[0].trim(),
                team_a: teams.team_a,
                team_b: teams.team_b,
                bet_on: record['My Prob (Pu)'] ? teams.team_a : null, // Infer from context
                category: record['Category'],
                market_odds: parseNumber(record['Market Odds (Pm)']),
                my_prob: parseNumber(record['My Prob (Pu)']),
                edge: parseNumber(record['Edge (Delta)']),
                reward_risk: parseNumber(record['Reward/Risk (b)']),
                expectancy: parseNumber(record['Expectancy (E)']),
                kelly_pct: parseNumber(record['Full Kelly %']),
                safe_size_pct: parseNumber(record['Safe Size (1/4 K)']),
                stake: parseNumber(record['Actual Size ($)']),
                outcome: outcome,
                pnl: parseNumber(record['PnL ($)']),
                reflection: record['Reflection'],
                llm_reason: record['LLM-wiki LoL reason why'],
                llm_post_mortem: record['LLM-wiki LoL post mortem'],
                league: league
            };
            
            try {
                await db.insertBet(bet);
                imported++;
                
                if (imported % 10 === 0) {
                    console.log(`Imported ${imported} bets...`);
                }
            } catch (err) {
                console.error(`Error importing bet: ${err.message}`);
                console.error('Record:', record);
            }
        }
        
        console.log(`\nImport complete!`);
        console.log(`Imported: ${imported}`);
        console.log(`Skipped: ${skipped}`);
        
        // Show stats
        const stats = await db.getBetStats();
        console.log('\nBet Statistics:');
        console.log(stats);
        
        await db.close();
        
    } catch (err) {
        console.error('Import failed:', err);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    importBets();
}

module.exports = { importBets, parseDate, extractTeams, detectLeague };
