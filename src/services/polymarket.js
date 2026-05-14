// Polymarket Data API Service
// Uses https://data-api.polymarket.com - NO authentication required!
// Docs: https://docs.polymarket.com/api-reference/introduction

const DATA_API_BASE = 'https://data-api.polymarket.com'

// LoL-related keywords to filter markets
const LOL_KEYWORDS = [
  'league of legends',
  'lol',
  'lck',
  'lpl',
  'lec',
  'lcs',
  'msi',
  'worlds',
  't1',
  'gen.g',
  'geng',
  'blg',
  'jdg',
  'g2',
  'fnatic',
  'hle',
  'dk',
  'kt',
  'tes',
  'wbg',
  'lng',
  'flyquest',
  'tl',
  'c9',
  '100t',
  'eg',
  'mad lions',
  'bds',
  'sk',
  'team vitality',
  'karmine corp',
  'giantx',
  'esports',
]

/**
 * Check if a market is LoL-related
 */
const isLoLMarket = (title) => {
  if (!title) return false
  const text = title.toLowerCase()
  return LOL_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))
}

/**
 * Extract teams from market title
 * Example: "T1 vs Gen.G - LCK Spring 2026" -> { teamA: "T1", teamB: "Gen.G" }
 */
const extractTeams = (title) => {
  if (!title) return { teamA: 'Team A', teamB: 'Team B' }
  
  const vsPatterns = [
    /(.+?)\s+vs\.?\s+(.+?)(?:\s+-|\s*\(|$)/i,
    /(.+?)\s+v\.?\s+(.+?)(?:\s+-|\s*\(|$)/i,
    /(.+?)\s+versus\s+(.+?)(?:\s+-|\s*\(|$)/i,
  ]
  
  for (const pattern of vsPatterns) {
    const match = title.match(pattern)
    if (match) {
      return {
        teamA: match[1].trim(),
        teamB: match[2].trim(),
      }
    }
  }
  
  return { teamA: title, teamB: 'Unknown' }
}

/**
 * Extract league from title or return default
 */
const extractLeague = (title) => {
  if (!title) return null
  const text = title.toLowerCase()
  if (text.includes('lck')) return 'LCK'
  if (text.includes('lpl')) return 'LPL'
  if (text.includes('lec')) return 'LEC'
  if (text.includes('lcs')) return 'LCS'
  if (text.includes('msi')) return 'MSI'
  if (text.includes('worlds')) return 'Worlds'
  return 'LoL'
}

/**
 * Map Polymarket position to our bet format
 */
const mapPositionToBet = (position, index, isClosed = false) => {
  const teams = extractTeams(position.title)
  const league = extractLeague(position.title)
  
  // Calculate odds from average price
  const avgPrice = position.avgPrice || 0
  const odds = avgPrice > 0 ? (1 / avgPrice).toFixed(2) : '1.00'
  
  // Determine result based on P&L
  const pnl = isClosed ? position.realizedPnl : position.cashPnl
  const result = pnl > 0 ? 'WIN' : pnl < 0 ? 'LOSS' : 'PENDING'
  
  // Stake calculation
  const stake = position.totalBought || position.initialValue || 0
  
  return {
    id: `pm-${isClosed ? 'closed' : 'open'}-${index}`,
    matchId: position.conditionId,
    event: league,
    league: league,
    team_a: teams.teamA,
    team_b: teams.teamB,
    betOn: position.outcome || 'Unknown',
    odds: parseFloat(odds),
    stake: stake,
    result: result,
    outcome: result,
    pnl: pnl,
    profit: pnl,
    date: position.endDate || new Date().toISOString(),
    settledDate: isClosed ? new Date(position.timestamp * 1000).toISOString() : null,
    marketUrl: `https://polymarket.com/event/${position.eventSlug || position.slug}`,
    match_description: position.title,
    category: position.outcome,
    market_odds: position.curPrice || avgPrice,
    my_prob: avgPrice,
    edge: 0, // Will be calculated if we compare to market odds
    // Additional Polymarket-specific fields
    currentPrice: position.curPrice,
    avgPrice: avgPrice,
    currentValue: position.currentValue,
    initialValue: position.initialValue,
    percentPnl: isClosed ? position.percentRealizedPnl : position.percentPnl,
    size: position.size,
    redeemable: position.redeemable,
    mergeable: position.mergeable,
  }
}

/**
 * Fetch user's current (open) positions from Polymarket Data API
 * No authentication required!
 */
export const fetchCurrentPositions = async (walletAddress) => {
  try {
    const url = new URL(`${DATA_API_BASE}/positions`)
    url.searchParams.append('user', walletAddress.toLowerCase())
    url.searchParams.append('limit', '500')
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const positions = await response.json()
    
    // Filter for LoL markets only
    const lolPositions = positions.filter(pos => isLoLMarket(pos.title))
    
    // Map to our bet format
    const bets = lolPositions.map((pos, index) => mapPositionToBet(pos, index, false))
    
    return bets
  } catch (error) {
    console.error('Error fetching current positions:', error)
    throw error
  }
}

/**
 * Fetch user's closed positions from Polymarket Data API
 * No authentication required!
 */
export const fetchClosedPositions = async (walletAddress) => {
  try {
    const url = new URL(`${DATA_API_BASE}/closed-positions`)
    url.searchParams.append('user', walletAddress.toLowerCase())
    url.searchParams.append('limit', '500')
    
    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const positions = await response.json()
    
    // Filter for LoL markets only
    const lolPositions = positions.filter(pos => isLoLMarket(pos.title))
    
    // Map to our bet format
    const bets = lolPositions.map((pos, index) => mapPositionToBet(pos, index, true))
    
    return bets
  } catch (error) {
    console.error('Error fetching closed positions:', error)
    throw error
  }
}

/**
 * Fetch all LoL positions (both current and closed)
 */
export const fetchPolymarketPositions = async (walletAddress) => {
  try {
    const [current, closed] = await Promise.all([
      fetchCurrentPositions(walletAddress).catch(err => {
        console.warn('Failed to fetch current positions:', err)
        return []
      }),
      fetchClosedPositions(walletAddress).catch(err => {
        console.warn('Failed to fetch closed positions:', err)
        return []
      }),
    ])
    
    return [...current, ...closed]
  } catch (error) {
    console.error('Error fetching all positions:', error)
    throw error
  }
}

/**
 * Calculate stats from Polymarket bets
 */
export const calculatePolymarketStats = (bets) => {
  const settledBets = bets.filter((bet) => bet.result !== 'PENDING')
  const totalBets = settledBets.length
  const wins = settledBets.filter((bet) => bet.result === 'WIN').length
  const losses = settledBets.filter((bet) => bet.result === 'LOSS').length
  const pending = bets.filter((bet) => bet.result === 'PENDING').length
  const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0
  const totalProfit = settledBets.reduce((sum, bet) => sum + (bet.pnl || 0), 0)
  const totalStaked = settledBets.reduce((sum, bet) => sum + bet.stake, 0)
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0

  return {
    totalBets: totalBets + pending,
    wins,
    losses,
    pending,
    winRate: winRate.toFixed(1),
    totalPnl: totalProfit.toFixed(2),
    totalStaked: totalStaked.toFixed(2),
    roi: roi.toFixed(1),
    avgWin: wins > 0 ? (settledBets.filter(b => b.pnl > 0).reduce((s, b) => s + b.pnl, 0) / wins).toFixed(2) : 0,
    avgLoss: losses > 0 ? (settledBets.filter(b => b.pnl < 0).reduce((s, b) => s + b.pnl, 0) / losses).toFixed(2) : 0,
  }
}

// Your wallet address
export const WALLET_ADDRESS = '0xe49756E59B79705991B166eAD9107A63E55984aa'
