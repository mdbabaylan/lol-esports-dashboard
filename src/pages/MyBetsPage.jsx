import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  Divider,
  CircularProgress,
  Alert,
  Link,
  Tooltip,
} from '@mui/material'
import {
  AccountBalanceWallet,
  EmojiEvents,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  SportsEsports,
  OpenInNew,
  Refresh,
} from '@mui/icons-material'
import {
  fetchPolymarketPositions,
  calculatePolymarketStats,
  WALLET_ADDRESS,
} from '../services/polymarket'

const betStatuses = ['All', 'Pending', 'Won', 'Lost']

const getStatusConfig = (outcome) => {
  const status = outcome?.toLowerCase()
  switch (status) {
    case 'win':
      return {
        icon: <CheckCircle fontSize="small" />,
        color: 'success',
        label: 'WON',
        bgColor: 'rgba(34, 197, 94, 0.15)',
      }
    case 'loss':
      return {
        icon: <Cancel fontSize="small" />,
        color: 'error',
        label: 'LOST',
        bgColor: 'rgba(239, 68, 68, 0.15)',
      }
    case 'pending':
    case 'open':
      return {
        icon: <HourglassEmpty fontSize="small" />,
        color: 'warning',
        label: 'PENDING',
        bgColor: 'rgba(245, 158, 11, 0.15)',
      }
    default:
      return {
        icon: null,
        color: 'default',
        label: outcome?.toUpperCase() || 'UNKNOWN',
        bgColor: 'rgba(100, 116, 139, 0.15)',
      }
  }
}

const StatCard = ({ title, value, subtitle, icon, color = 'primary', trend }) => {
  const isPositive = trend && trend > 0
  const isNegative = trend && trend < 0

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: 'background.default',
        height: '100%',
        minHeight: 100,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, mb: 0.5 }}>
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {trend !== undefined && (
            <Stack direction="row" alignItems="center" spacing={0.5} mt={0.5}>
              {isPositive && <TrendingUp fontSize="small" color="success" />}
              {isNegative && <TrendingDown fontSize="small" color="error" />}
              <Typography
                variant="body2"
                fontWeight={600}
                color={isPositive ? 'success.main' : isNegative ? 'error.main' : 'text.secondary'}
              >
                {isPositive ? '+' : ''}{trend}%
              </Typography>
            </Stack>
          )}
        </Box>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: 1.5,
            bgcolor: `${color}.main`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Box>
  )
}

const MyBetsPage = () => {
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [bets, setBets] = useState([])
  const [stats, setStats] = useState({
    totalBets: 0,
    wins: 0,
    losses: 0,
    pending: 0,
    winRate: 0,
    totalPnl: 0,
    totalStaked: 0,
    roi: 0,
    avgWin: 0,
    avgLoss: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBets = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const positions = await fetchPolymarketPositions(WALLET_ADDRESS)
      setBets(positions)
      
      const calculatedStats = calculatePolymarketStats(positions)
      setStats(calculatedStats)
    } catch (err) {
      console.error('Error fetching Polymarket positions:', err)
      setError('Failed to load positions from Polymarket. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBets()
  }, [])

  const filteredBets = bets.filter((bet) => {
    if (selectedStatus === 'All') return true
    if (selectedStatus === 'Pending') return bet.outcome === 'PENDING' || bet.outcome === 'OPEN'
    if (selectedStatus === 'Won') return bet.outcome === 'WIN'
    if (selectedStatus === 'Lost') return bet.outcome === 'LOSS'
    return true
  })

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return '-'
    const num = parseFloat(value)
    return num >= 0 ? `$${num.toFixed(2)}` : `-$${Math.abs(num).toFixed(2)}`
  }

  const formatPercent = (value) => {
    if (value === null || value === undefined) return '-'
    return `${(value * 100).toFixed(1)}%`
  }

  const getLeagueColor = (league) => {
    switch (league?.toUpperCase()) {
      case 'LPL': return '#ef4444'
      case 'LCK': return '#3b82f6'
      case 'LEC': return '#22c55e'
      case 'LCS': return '#a855f7'
      case 'MSI': return '#f59e0b'
      case 'WORLDS': return '#ec4899'
      default: return '#6b7280'
    }
  }

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <AccountBalanceWallet color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                My Bets
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Live Polymarket Positions • {bets.length} LoL Markets
              </Typography>
            </Box>
          </Stack>
          <Chip
            icon={loading ? <CircularProgress size={14} /> : <Refresh fontSize="small" />}
            label={loading ? 'Loading...' : 'Refresh'}
            onClick={fetchBets}
            disabled={loading}
            sx={{
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          />
        </Stack>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Stats Overview */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Bets"
              value={stats.totalBets}
              subtitle={`${stats.wins} wins • ${stats.losses} losses • ${stats.pending} pending`}
              icon={<SportsEsports />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Win Rate"
              value={`${stats.winRate}%`}
              subtitle={`${stats.wins} / ${parseInt(stats.wins) + parseInt(stats.losses)} settled`}
              icon={<EmojiEvents />}
              color="success"
              trend={parseFloat(stats.winRate) - 50}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total P&L"
              value={formatCurrency(stats.totalPnl)}
              subtitle={`ROI: ${stats.roi}%`}
              icon={parseFloat(stats.totalPnl) >= 0 ? <TrendingUp /> : <TrendingDown />}
              color={parseFloat(stats.totalPnl) >= 0 ? 'success' : 'error'}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Avg Win/Loss"
              value={`+${formatCurrency(stats.avgWin).replace('$', '')} / ${formatCurrency(stats.avgLoss)}`}
              subtitle={`$${formatCurrency(stats.totalStaked).replace('$', '')} staked`}
              icon={<AccountBalanceWallet />}
              color="info"
            />
          </Grid>
        </Grid>
      </Card>

      {/* Bets Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          {/* Tabs */}
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Tabs
              value={selectedStatus}
              onChange={(e, newValue) => setSelectedStatus(newValue)}
              sx={{
                '& .MuiTabs-flexContainer': {
                  gap: 1,
                },
                '& .MuiTabs-indicator': {
                  display: 'none',
                },
              }}
            >
              {betStatuses.map((status) => (
                <Tab
                  key={status}
                  value={status}
                  label={status}
                  sx={{
                    textTransform: 'none',
                    minHeight: 36,
                    px: 2,
                    borderRadius: 2,
                    fontWeight: 600,
                    color: 'text.secondary',
                    '&.Mui-selected': {
                      color: 'white',
                      bgcolor: 'primary.main',
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <Divider />

          {/* Table */}
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>League</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Match</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Bet On</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Avg Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Current</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Stake</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">P&L</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="center">Link</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBets.map((bet) => {
                    const statusConfig = getStatusConfig(bet.outcome)

                    return (
                      <TableRow
                        key={bet.id}
                        sx={{
                          '&:hover': {
                            bgcolor: 'rgba(99, 102, 241, 0.03)',
                          },
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {formatDate(bet.date)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {bet.league && (
                            <Chip
                              label={bet.league}
                              size="small"
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                bgcolor: `${getLeagueColor(bet.league)}20`,
                                color: getLeagueColor(bet.league),
                                height: 20,
                              }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title={bet.match_description || ''} arrow>
                            <Box>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Typography variant="body2" fontWeight={600}>
                                  {bet.team_a}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  vs
                                </Typography>
                                <Typography variant="body2" fontWeight={600}>
                                  {bet.team_b}
                                </Typography>
                              </Stack>
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600} color="primary.light">
                            {bet.betOn}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={formatPercent(bet.avgPrice)}
                            size="small"
                            sx={{
                              fontWeight: 600,
                              fontSize: '0.7rem',
                              bgcolor: 'rgba(99, 102, 241, 0.15)',
                              color: 'primary.light',
                              height: 20,
                            }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={bet.currentPrice > bet.avgPrice ? 'success.main' : bet.currentPrice < bet.avgPrice ? 'error.main' : 'text.secondary'}
                          >
                            {formatPercent(bet.currentPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(bet.stake)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={statusConfig.icon}
                            label={statusConfig.label}
                            size="small"
                            sx={{
                              fontWeight: 700,
                              fontSize: '0.7rem',
                              bgcolor: statusConfig.bgColor,
                              color: `${statusConfig.color}.main`,
                              height: 22,
                              '& .MuiChip-icon': {
                                color: 'inherit',
                                fontSize: '0.9rem',
                              },
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title={bet.percentPnl ? `${bet.percentPnl.toFixed(2)}% return` : ''} arrow>
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              color={
                                bet.pnl > 0 ? 'success.main' : bet.pnl < 0 ? 'error.main' : 'text.secondary'
                              }
                            >
                              {bet.pnl > 0 ? '+' : ''}
                              {formatCurrency(bet.pnl)}
                            </Typography>
                          </Tooltip>
                        </TableCell>
                        <TableCell align="center">
                          {bet.marketUrl && (
                            <Link href={bet.marketUrl} target="_blank" rel="noopener" color="inherit">
                              <OpenInNew fontSize="small" sx={{ fontSize: 16, color: 'text.secondary', '&:hover': { color: 'primary.main' } }} />
                            </Link>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {!loading && filteredBets.length === 0 && (
            <Box textAlign="center" py={6}>
              <HourglassEmpty sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No bets found
              </Typography>
              <Typography variant="body2" color="text.disabled">
                Try selecting a different filter
              </Typography>
            </Box>
          )}
          
          {!loading && filteredBets.length > 0 && (
            <Box sx={{ px: 2, py: 1, bgcolor: 'background.default' }}>
              <Typography variant="caption" color="text.secondary">
                Showing {filteredBets.length} of {bets.length} positions • Wallet: {WALLET_ADDRESS.slice(0, 6)}...{WALLET_ADDRESS.slice(-4)}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

export default MyBetsPage
