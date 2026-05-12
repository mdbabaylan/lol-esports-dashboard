import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Button,
  Tooltip,
} from '@mui/material'
import {
  SportsEsports,
  EmojiEvents,
  LiveTv,
  CheckCircle,
  HourglassEmpty,
  AccessTime,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Refresh,
  CalendarToday,
} from '@mui/icons-material'

const API_BASE_URL = 'http://localhost:3001/api'

const getStatusConfig = (status) => {
  switch (status) {
    case 'live':
      return {
        icon: <LiveTv fontSize="small" />,
        color: 'error',
        label: 'LIVE',
      }
    case 'completed':
      return {
        icon: <CheckCircle fontSize="small" />,
        color: 'success',
        label: 'FINISHED',
      }
    case 'upcoming':
      return {
        icon: <AccessTime fontSize="small" />,
        color: 'info',
        label: 'SCHEDULED',
      }
    default:
      return {
        icon: null,
        color: 'default',
        label: status?.toUpperCase() || 'UNKNOWN',
      }
  }
}

const getLeagueColor = (league) => {
  switch (league?.toUpperCase()) {
    case 'LPL': return '#ef4444'
    case 'LCK': return '#3b82f6'
    case 'LEC': return '#22c55e'
    case 'LCS': return '#a855f7'
    default: return '#6b7280'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

const MatchRow = ({ match }) => {
  const statusConfig = getStatusConfig(match.status)
  const isCompleted = match.status === 'completed'
  const isLive = match.status === 'live'
  const isUpcoming = match.status === 'upcoming'

  return (
    <TableRow
      sx={{
        '&:hover': {
          bgcolor: 'rgba(99, 102, 241, 0.03)',
        },
        transition: 'background-color 0.15s',
      }}
    >
      {/* Date / Time */}
      <TableCell sx={{ py: 1.5, width: 100 }}>
        <Stack alignItems="center" spacing={0.5}>
          {isLive ? (
            <Chip
              icon={<LiveTv fontSize="small" />}
              label="LIVE"
              color="error"
              size="small"
              sx={{
                height: 22,
                fontSize: '0.65rem',
                fontWeight: 700,
                animation: 'pulse 2s infinite',
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.7 },
                },
              }}
            />
          ) : (
            <>
              <Typography variant="caption" fontWeight={700} color="primary.main">
                {formatDate(match.date)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(match.date)}
              </Typography>
            </>
          )}
        </Stack>
      </TableCell>

      {/* League */}
      <TableCell sx={{ py: 1.5, width: 80 }}>
        <Chip
          label={match.league}
          size="small"
          sx={{
            height: 20,
            fontSize: '0.7rem',
            fontWeight: 700,
            bgcolor: `${getLeagueColor(match.league)}20`,
            color: getLeagueColor(match.league),
          }}
        />
      </TableCell>

      {/* Team A */}
      <TableCell sx={{ py: 1.5 }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1.5}>
          <Typography
            variant="body1"
            fontWeight={600}
            color="text.primary"
          >
            {match.team1?.toUpperCase()}
          </Typography>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: 'primary.main',
              fontSize: '0.65rem',
              fontWeight: 700,
            }}
          >
            {match.team1?.substring(0, 2).toUpperCase()}
          </Avatar>
        </Stack>
      </TableCell>

      {/* VS / Score */}
      <TableCell sx={{ py: 1.5, width: 80 }} align="center">
        {isCompleted ? (
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
            <Typography variant="h6" fontWeight={700}>
              {match.score1 || 0}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mx: 0.5 }}>
              -
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {match.score2 || 0}
            </Typography>
          </Stack>
        ) : (
          <Tooltip title={match.series || 'Bo3'} arrow>
            <Typography
              variant="caption"
              fontWeight={700}
              color="text.secondary"
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'rgba(100, 116, 139, 0.15)',
              }}
            >
              VS
            </Typography>
          </Tooltip>
        )}
      </TableCell>

      {/* Team B */}
      <TableCell sx={{ py: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: 'secondary.main',
              fontSize: '0.65rem',
              fontWeight: 700,
              color: 'background.paper',
            }}
          >
            {match.team2?.substring(0, 2).toUpperCase()}
          </Avatar>
          <Typography
            variant="body1"
            fontWeight={600}
            color="text.primary"
          >
            {match.team2?.toUpperCase()}
          </Typography>
        </Stack>
      </TableCell>

      {/* Status */}
      <TableCell sx={{ py: 1.5, width: 100 }} align="right">
        <Chip
          icon={statusConfig.icon}
          label={statusConfig.label}
          size="small"
          color={statusConfig.color}
          sx={{
            height: 22,
            fontSize: '0.65rem',
            fontWeight: 700,
          }}
        />
      </TableCell>
    </TableRow>
  )
}

const DaySection = ({ date, dateMatches }) => {
  const [expanded, setExpanded] = useState(true)

  return (
    <Card sx={{ mb: 2 }}>
      {/* Day Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: 'background.default',
          borderBottom: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <CalendarToday fontSize="small" color="primary" />
            <Typography variant="subtitle1" fontWeight={700}>
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
            <Chip
              label={`${dateMatches.length} matches`}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 600,
                bgcolor: 'rgba(99, 102, 241, 0.15)',
                color: 'primary.light',
              }}
            />
          </Stack>
          {expanded ? (
            <KeyboardArrowUp fontSize="small" color="action" />
          ) : (
            <KeyboardArrowDown fontSize="small" color="action" />
          )}
        </Stack>
      </Box>

      {/* Matches Table */}
      {expanded && (
        <TableContainer>
          <Table size="small">
            <TableBody>
              {dateMatches.map((match, index) => (
                <MatchRow key={`${match.team1}-${match.team2}-${index}`} match={match} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Card>
  )
}

const MatchesPage = () => {
  const [statusFilter, setStatusFilter] = useState('All')
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_BASE_URL}/schedule`)
      
      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`)
      }
      
      const data = await response.json()
      setSchedule(data)
      setLastUpdated(data.last_updated)
    } catch (err) {
      console.error('Error fetching schedule:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchedule()
  }, [])

  // Filter matches by status
  const filteredMatches = schedule?.matches?.filter((match) => {
    if (statusFilter === 'All') return true
    if (statusFilter === 'Live') return match.status === 'live'
    if (statusFilter === 'Scheduled') return match.status === 'upcoming'
    if (statusFilter === 'Finished') return match.status === 'completed'
    return true
  }) || []

  // Group matches by date
  const groupedMatches = filteredMatches.reduce((acc, match) => {
    const date = match.date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(match)
    return acc
  }, {})

  // Sort dates
  const sortedDates = Object.keys(groupedMatches).sort()

  return (
    <Box>
      {/* Header */}
      <Box mb={3}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <SportsEsports color="primary" sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Matches
              </Typography>
              {lastUpdated && (
                <Typography variant="caption" color="text.secondary">
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </Typography>
              )}
            </Box>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            startIcon={loading ? <CircularProgress size={14} /> : <Refresh />}
            onClick={fetchSchedule}
            disabled={loading}
          >
            Refresh
          </Button>
        </Stack>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filter Tabs */}
        <Card>
          <Tabs
            value={statusFilter}
            onChange={(e, newValue) => setStatusFilter(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              px: 1,
              '& .MuiTabs-flexContainer': {
                gap: 0.5,
              },
              '& .MuiTabs-indicator': {
                display: 'none',
              },
            }}
          >
            {['All', 'Live', 'Scheduled', 'Finished'].map((status) => (
              <Tab
                key={status}
                value={status}
                label={status}
                sx={{
                  textTransform: 'none',
                  minHeight: 40,
                  px: 2,
                  py: 0.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'white',
                    bgcolor: status === 'Live' ? 'error.main' : 'primary.main',
                  },
                }}
              />
            ))}
          </Tabs>
        </Card>
      </Box>

      {/* Loading State */}
      {loading && !schedule && (
        <Box textAlign="center" py={8}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Loading schedule...
          </Typography>
        </Box>
      )}

      {/* Matches by Day */}
      {!loading && sortedDates.length > 0 && (
        <Stack spacing={0}>
          {sortedDates.map((date) => (
            <DaySection
              key={date}
              date={date}
              dateMatches={groupedMatches[date]}
            />
          ))}
        </Stack>
      )}

      {/* Empty State */}
      {!loading && sortedDates.length === 0 && (
        <Box textAlign="center" py={8}>
          <SportsEsports sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No matches found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Try selecting a different filter or check back later
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default MatchesPage
