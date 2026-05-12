import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Grid,
  Stack,
  Avatar,
  Chip,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
} from '@mui/material'
import {
  PersonSearch,
  Search,
  SportsEsports,
  TrendingUp,
  Visibility,
  AttachMoney,
  LocalFireDepartment,
} from '@mui/icons-material'
import { players } from '../data/mockData'

const roles = ['All', 'Top', 'Jungle', 'Mid', 'ADC', 'Support']

const roleColors = {
  Top: '#ef4444',
  Jungle: '#22c55e',
  Mid: '#3b82f6',
  ADC: '#f59e0b',
  Support: '#a855f7',
}

const PlayerCard = ({ player }) => {
  const roleColor = roleColors[player.role] || '#64748b'

  return (
    <Card
      sx={{
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.3)',
        },
        height: '100%',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" spacing={2} mb={2}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: roleColor,
              fontSize: '1.25rem',
              fontWeight: 700,
            }}
          >
            {player.name.substring(0, 2)}
          </Avatar>
          <Box flex={1}>
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              mb={0.5}
            >
              <Typography variant="h6" fontWeight={700}>
                {player.name}
              </Typography>
              <Chip
                label={player.role}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  bgcolor: `${roleColor}20`,
                  color: roleColor,
                  border: `1px solid ${roleColor}40`,
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {player.realName}
            </Typography>
            <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
              <Chip
                label={player.team}
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  bgcolor: 'rgba(99, 102, 241, 0.15)',
                  color: 'primary.light',
                  fontWeight: 600,
                }}
              />
              <Chip
                label={player.region}
                size="small"
                variant="outlined"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Stats Grid */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
              <LocalFireDepartment fontSize="small" color="error" />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                KDA
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700} color="success.main">
              {player.stats.kda}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
              <TrendingUp fontSize="small" color="primary" />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                CS/MIN
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {player.stats.csPerMin}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
              <AttachMoney fontSize="small" color="warning" />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                GOLD/MIN
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {player.stats.goldPerMin}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Stack direction="row" alignItems="center" spacing={0.5} mb={0.5}>
              <Visibility fontSize="small" color="info" />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                VISION
              </Typography>
            </Stack>
            <Typography variant="h6" fontWeight={700}>
              {player.stats.visionScore}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        {/* Champion Pool */}
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            CHAMPION POOL
          </Typography>
          <Stack direction="row" spacing={0.5} mt={1} flexWrap="wrap" useFlexGap>
            {player.stats.championPool.map((champion) => (
              <Chip
                key={champion}
                label={champion}
                size="small"
                sx={{
                  height: 24,
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(99, 102, 241, 0.1)',
                  color: 'primary.light',
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Detailed Stats */}
        <Box mt={2}>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>
            AVG PER GAME
          </Typography>
          <Stack
            direction="row"
            justifyContent="space-between"
            mt={1}
            sx={{
              bgcolor: 'background.default',
              borderRadius: 1,
              p: 1,
            }}
          >
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Kills
              </Typography>
              <Typography variant="body2" fontWeight={700} color="success.main">
                {player.stats.kills}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Deaths
              </Typography>
              <Typography variant="body2" fontWeight={700} color="error.main">
                {player.stats.deaths}
              </Typography>
            </Box>
            <Box textAlign="center">
              <Typography variant="caption" color="text.secondary">
                Assists
              </Typography>
              <Typography variant="body2" fontWeight={700} color="info.main">
                {player.stats.assists}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  )
}

const PlayersPage = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')

  const filteredPlayers = players.filter((player) => {
    const matchesSearch =
      player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      player.team.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'All' || player.role === selectedRole
    return matchesSearch && matchesRole
  })

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          <PersonSearch color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Players
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Search and analyze player statistics from top leagues
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2.5 }}>
          <Stack spacing={2}>
            <TextField
              fullWidth
              placeholder="Search players by name or team..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <Box>
              <Tabs
                value={selectedRole}
                onChange={(e, newValue) => setSelectedRole(newValue)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  '& .MuiTabs-flexContainer': {
                    gap: 1,
                  },
                  '& .MuiTabs-indicator': {
                    display: 'none',
                  },
                }}
              >
                {roles.map((role) => (
                  <Tab
                    key={role}
                    value={role}
                    label={role}
                    sx={{
                      textTransform: 'none',
                      minHeight: 36,
                      px: 2,
                      borderRadius: 2,
                      fontWeight: 600,
                      color: 'text.secondary',
                      '&.Mui-selected': {
                        color: 'white',
                        bgcolor: role === 'All' ? 'primary.main' : roleColors[role],
                      },
                    }}
                  />
                ))}
              </Tabs>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      {/* Results Count */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="body2" color="text.secondary">
          Showing {filteredPlayers.length} player{filteredPlayers.length !== 1 ? 's' : ''}
        </Typography>
        <Chip
          icon={<SportsEsports fontSize="small" />}
          label={`${players.length} total players`}
          size="small"
          sx={{
            fontWeight: 600,
            bgcolor: 'rgba(99, 102, 241, 0.15)',
            color: 'primary.light',
          }}
        />
      </Stack>

      {/* Players Grid */}
      <Grid container spacing={2.5}>
        {filteredPlayers.map((player) => (
          <Grid item xs={12} sm={6} lg={4} xl={3} key={player.id}>
            <PlayerCard player={player} />
          </Grid>
        ))}
      </Grid>

      {filteredPlayers.length === 0 && (
        <Box textAlign="center" py={8}>
          <PersonSearch sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No players found
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Try adjusting your search or filter criteria
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default PlayersPage
