// Polymarket API Service
// Fetches user positions and filters for LoL-related markets

// Use local proxy server in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const POLYMARKET_PROXY_URL = `${API_BASE_URL}/api/polymarket`

// GraphQL query to get user positions
const GET_USER_POSITIONS = `
  query GetUserPositions($walletAddress: String!) {
    user(walletAddress: $walletAddress) {
      positions {
        market {
          id
          question
          description
          slug
          category
          tags
          outcomes
          outcomePrices
          endDate
          status
        }
        outcomeIndex
        quantity
        avgPrice
        value
        pnl
        pnlPercent
      }
    }
  }
`

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
]

/**
 * Check if a market is LoL-related
 */
const isLoLMarket = (market) => {
  const text = `${market.question} ${market.description || ''} ${market.category || ''} ${(market.tags || []).join(' ')}`.toLowerCase()
  return LOL_KEYWORDS.some(keyword => text.includes(keyword.toLowerCase()))
}

/**
 * Extract teams from market question
 * Example: "T1 vs Gen.G - LCK Spring 2026" -> { teamA: "T1", teamB: "Gen.G" }
 */
const extractTeams = (question) => {
  const vsPatterns = [
    /(.+?)\s+vs\.?\s+(.+?)(?:\s+-|\s*\(|$)/i,
    /(.+?)\s+v\.?\s+(.+?)(?:\s+-|\s*\(|$)/i,
    /(.+?)\s+versus\s+(.+?)(?:\s+-|\s*\(|$)/i,
  ]
  
  for (const pattern of vsPatterns) {
    const match = question.match(pattern)
    if (match) {
      return {
        teamA: match[1].trim(),
        teamB: match[2].trim(),
      }
    }
  }
  
  return { teamA: 'Team A', teamB: 'Team B' }
}

/**
 * Map Polymarket position to our bet format
 */
const mapPositionToBet = (position, index) => {
  const market = position.market
  const teams = extractTeams(market.question)
  const outcomes = market.outcomes || ['Yes', 'No']
  const outcomePrices = market.outcomePrices ? JSON.parse(market.outcomePrices) : [0.5, 0.5]
  
  // Determine if user bet on Team A or Team B
  const betOn = position.outcomeIndex === 0 ? teams.teamA : teams.teamB
  const odds = position.avgPrice > 0 ? (1 / position.avgPrice).toFixed(2) : '1.00'
  
  // Calculate P&L
  const stake = position.quantity || 0
  const profit = position.pnl || 0
  const result = profit > 0 ? 'win' : profit < 0 ? 'loss' : 'pending'
  
  return {
    id: `pm-${index}`,
    matchId: market.id,
    event: market.category || 'Polymarket',
    teamA: teams.teamA,
    teamB: teams.teamB,
    betOn: betOn,
    odds: parseFloat(odds),
    stake: stake,
    result: result,
    payout: result === 'win' ? stake + profit : result === 'loss' ? 0 : null,
    profit: profit,
    date: market.endDate || new Date().toISOString(),
    settledDate: market.status === 'RESOLVED' ? market.endDate : null,
    marketUrl: `https://polymarket.com/event/${market.slug}`,
    question: market.question,
  }
}

/**
 * Fetch user's Polymarket positions via local proxy
 */
export const fetchPolymarketPositions = async (walletAddress) => {
  try {
    const response = await fetch(POLYMARKET_PROXY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: GET_USER_POSITIONS,
        variables: { walletAddress: walletAddress.toLowerCase() },
      }),
    })
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors)
      throw new Error(data.errors[0].message)
    }
    
    const positions = data.data?.user?.positions || []
    
    // Filter for LoL markets only
    const lolPositions = positions.filter(pos => isLoLMarket(pos.market))
    
    // Map to our bet format
    const bets = lolPositions.map((pos, index) => mapPositionToBet(pos, index))
    
    return bets
  } catch (error) {
    console.error('Error fetching Polymarket positions:', error)
    throw error
  }
}

/**
 * Calculate stats from Polymarket bets
 */
export const calculatePolymarketStats = (bets) => {
  const settledBets = bets.filter((bet) => bet.result !== 'pending')
  const totalBets = settledBets.length
  const wins = settledBets.filter((bet) => bet.result === 'win').length
  const losses = settledBets.filter((bet) => bet.result === 'loss').length
  const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0
  const totalProfit = settledBets.reduce((sum, bet) => sum + (bet.profit || 0), 0)
  const totalStaked = settledBets.reduce((sum, bet) => sum + bet.stake, 0)
  const roi = totalStaked > 0 ? (totalProfit / totalStaked) * 100 : 0

  return {
    totalBets,
    wins,
    losses,
    winRate: winRate.toFixed(1),
    totalProfit: totalProfit.toFixed(2),
    totalStaked: totalStaked.toFixed(2),
    roi: roi.toFixed(1),
  }
}

// Your wallet address
export const WALLET_ADDRESS = '0xe49756E59B79705991B166eAD9107A63E55984aa'
