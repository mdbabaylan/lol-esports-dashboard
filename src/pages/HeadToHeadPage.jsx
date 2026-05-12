import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Autocomplete,
  Button,
  Grid,
  Stack,
  Avatar,
  Chip,
  Divider,
  LinearProgress,
  Paper,
} from '@mui/material'
import {
  CompareArrows,
  TrendingUp,
  History,
  Search,
  EmojiEvents,
  AccessTime,
} from '@mui/icons-material'
import { teams, getH2HHistory, getTeamByName } from '../data/mockData'

const TeamSelector = ({ label, value, onChange, options }) => (
  <Autocomplete
    value={value}
    onChange={onChange}
    options={options}
    getOptionLabel={(option) => option.name}
    renderOption={(props, option) => (
      <Box component="li" {...props}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: 'primary.main',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            {option.logo.substring(0, 2)}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {option.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {option.region} • {option.country}
            </Typography>
          </Box>
        </Stack>
      </Box>
    )}
    renderInput={(params) => (
      <TextField
        {...params}
        label={label}
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
          },
        }}
      />
    )}
    sx={{ minWidth: 250 }}
  />
)

const StatBar = ({ label, valueA, valueB, max, colorA = 'primary', colorB = 'secondary' }) => {
  const percentageA = max > 0 ? (valueA / max) * 100 : 0
  const percentageB = max > 0 ? (valueB / max) * 100 : 0

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="body2" fontWeight={600} color={`${colorA}.main`}>
          {valueA}
        </Typography>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600} color={`${colorB}.main`}>
          {valueB}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={0.5} height={6}>
        <Box
          sx={{
            width: `${percentageA}%`,
            bgcolor: `${colorA}.main`,
            borderRadius: '3px 0 0 3px',
            transition: 'width 0.5s ease',
          }}
        />
        <Box
          sx={{
            width: `${percentageB}%`,
            bgcolor: `${colorB}.main`,
            borderRadius: '0 3px 3px 0',
            transition: 'width 0.5s ease',
          }}
        />
      </Stack>
    </Box>
  )
}

const FormIndicator = ({ results }) => (
  <Stack direction="row" spacing={0.5}>
    {results.map((result, index) => (
      <Box
        key={index}
        sx={{
          width: 24,
          height: 24,
          borderRadius: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: result === 'W' ? 'success.main' : 'error.main',
          color: 'white',
          fontSize: '0.75rem',
          fontWeight: 700,
        }}
      >
        {result}
      </Box>
    ))}
  </Stack>
)

const HeadToHeadPage = () => {
  const [teamA, setTeamA] = useState(null)
  const [teamB, setTeamB] = useState(null)
  const [showComparison, setShowComparison] = useState(false)

  const handleCompare = () => {
    if (teamA && teamB && teamA.id !== teamB.id) {
      setShowComparison(true)
    }
  }

  const h2hHistory = showComparison && teamA && teamB
    ? getH2HHistory(teamA.name, teamB.name)
    : []

  const teamAWins = h2hHistory.filter(
    (m) =>
      (m.teamA.name === teamA.name && m.teamA.score > m.teamB.score) ||
      (m.teamB.name === teamA.name && m.teamB.score > m.teamA.score)
  ).length

  const teamBWins = h2hHistory.filter(
    (m) =>
      (m.teamA.name === teamB.name && m.teamA.score > m.teamB.score) ||
      (m.teamB.name === teamB.name && m.teamB.score > m.teamA.score)
  ).length

  return (
    <Box>
      {/* Header */}
      <Box mb={4}>
        <Stack direction="row" alignItems="center" spacing={1.5} mb={1}>
          <CompareArrows color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight={700}>
            Head-to-Head
          </Typography>
        </Stack>
        <Typography variant="body1" color="text.secondary">
          Compare teams and analyze their matchup history
        </Typography>
      </Box>

      {/* Team Selectors */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <TeamSelector
              label="Select Team A"
              value={teamA}
              onChange={(e, newValue) => {
                setTeamA(newValue)
                setShowComparison(false)
              }}
              options={teams}
            />
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="body2" fontWeight={700} color="text.secondary">
                VS
              </Typography>
            </Box>
            <TeamSelector
              label="Select Team B"
              value={teamB}
              onChange={(e, newValue) => {
                setTeamB(newValue)
                setShowComparison(false)
              }}
              options={teams}
            />
            <Button
              variant="contained"
              size="large"
              startIcon={<Search />}
              onClick={handleCompare}
              disabled={!teamA || !teamB || teamA.id === teamB.id}
              sx={{
                minWidth: 140,
                height: 48,
                borderRadius: 2,
              }}
            >
              Compare
            </Button>
          </Stack>
          {teamA && teamB && teamA.id === teamB.id && (
            <Typography
              variant="caption"
              color="error"
              sx={{ display: 'block', textAlign: 'center', mt: 2 }}
            >
              Please select two different teams
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Comparison Results */}
      {showComparison && teamA && teamB && (
        <Stack spacing={3}>
          {/* Team Overview Cards */}
          <Grid container spacing={3}>
            {/* Team A Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    mb={3}
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'primary.main',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                      }}
                    >
                      {teamA.logo.substring(0, 2)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        {teamA.name}
                      </Typography>
                      <Chip
                        label={teamA.region}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        WIN RATE
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="primary.main">
                        {teamA.stats.winRate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={teamA.stats.winRate}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(99, 102, 241, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          WINS
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          {teamA.stats.wins}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          LOSSES
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="error.main">
                          {teamA.stats.losses}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          MATCHES
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {teamA.stats.matchesPlayed}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        RECENT FORM
                      </Typography>
                      <Box mt={0.5}>
                        <FormIndicator results={teamA.recentForm} />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Team B Card */}
            <Grid item xs={12} md={6}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    mb={3}
                  >
                    <Avatar
                      sx={{
                        width: 64,
                        height: 64,
                        bgcolor: 'secondary.main',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        color: 'background.paper',
                      }}
                    >
                      {teamB.logo.substring(0, 2)}
                    </Avatar>
                    <Box>
                      <Typography variant="h5" fontWeight={700}>
                        {teamB.name}
                      </Typography>
                      <Chip
                        label={teamB.region}
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        WIN RATE
                      </Typography>
                      <Typography variant="h4" fontWeight={700} color="secondary.main">
                        {teamB.stats.winRate}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={teamB.stats.winRate}
                        color="secondary"
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'rgba(34, 211, 238, 0.2)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    <Stack direction="row" justifyContent="space-between">
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          WINS
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="success.main">
                          {teamB.stats.wins}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          LOSSES
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="error.main">
                          {teamB.stats.losses}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          MATCHES
                        </Typography>
                        <Typography variant="h6" fontWeight={700}>
                          {teamB.stats.matchesPlayed}
                        </Typography>
                      </Box>
                    </Stack>

                    <Box>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        RECENT FORM
                      </Typography>
                      <Box mt={0.5}>
                        <FormIndicator results={teamB.recentForm} />
                      </Box>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* H2H Stats Comparison */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <TrendingUp color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Statistical Comparison
                </Typography>
              </Stack>

              <Stack spacing={3}>
                <StatBar
                  label="Win Rate %"
                  valueA={teamA.stats.winRate}
                  valueB={teamB.stats.winRate}
                  max={100}
                />
                <StatBar
                  label="First Blood Rate %"
                  valueA={teamA.stats.firstBloodRate}
                  valueB={teamB.stats.firstBloodRate}
                  max={100}
                />
                <StatBar
                  label="First Dragon Rate %"
                  valueA={teamA.stats.firstDragonRate}
                  valueB={teamB.stats.firstDragonRate}
                  max={100}
                />
                <StatBar
                  label="First Baron Rate %"
                  valueA={teamA.stats.firstBaronRate}
                  valueB={teamB.stats.firstBaronRate}
                  max={100}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* H2H History */}
          <Card>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} mb={3}>
                <History color="primary" />
                <Typography variant="h6" fontWeight={600}>
                  Head-to-Head History
                </Typography>
                <Chip
                  label={`${teamA.name} ${teamAWins} - ${teamBWins} ${teamB.name}`}
                  size="small"
                  sx={{
                    ml: 'auto',
                    fontWeight: 600,
                    bgcolor: 'rgba(99, 102, 241, 0.15)',
                    color: 'primary.light',
                  }}
                />
              </Stack>

              {h2hHistory.length > 0 ? (
                <Stack spacing={2}>
                  {h2hHistory.map((match) => {
                    const isTeamAWinner =
                      (match.teamA.name === teamA.name && match.teamA.score > match.teamB.score) ||
                      (match.teamB.name === teamA.name && match.teamB.score > match.teamA.score)

                    return (
                      <Paper
                        key={match.id}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderColor: isTeamAWinner ? 'primary.main' : 'secondary.main',
                          bgcolor: isTeamAWinner
                            ? 'rgba(99, 102, 241, 0.05)'
                            : 'rgba(34, 211, 238, 0.05)',
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <EmojiEvents fontSize="small" color="action" />
                            <Typography variant="body2" fontWeight={600}>
                              {match.event}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {match.stage}
                            </Typography>
                          </Stack>
                          <Chip
                            label={new Date(match.date).toLocaleDateString()}
                            size="small"
                            variant="outlined"
                            sx={{ height: 22, fontSize: '0.7rem' }}
                          />
                        </Stack>
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="center"
                          spacing={3}
                          mt={2}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: match.teamA.name === teamA.name ? 'primary.main' : 'secondary.main',
                                fontSize: '0.75rem',
                              }}
                            >
                              {match.teamA.logo.substring(0, 2)}
                            </Avatar>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color={
                                match.teamA.score > match.teamB.score ? 'success.main' : 'text.secondary'
                              }
                            >
                              {match.teamA.name}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color={
                                match.teamA.score > match.teamB.score ? 'success.main' : 'text.secondary'
                              }
                            >
                              {match.teamA.score}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                            <Typography
                              variant="h5"
                              fontWeight={700}
                              color={
                                match.teamB.score > match.teamA.score ? 'success.main' : 'text.secondary'
                              }
                            >
                              {match.teamB.score}
                            </Typography>
                          </Stack>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Typography
                              variant="body1"
                              fontWeight={600}
                              color={
                                match.teamB.score > match.teamA.score ? 'success.main' : 'text.secondary'
                              }
                            >
                              {match.teamB.name}
                            </Typography>
                            <Avatar
                              sx={{
                                width: 32,
                                height: 32,
                                bgcolor: match.teamB.name === teamA.name ? 'primary.main' : 'secondary.main',
                                fontSize: '0.75rem',
                              }}
                            >
                              {match.teamB.logo.substring(0, 2)}
                            </Avatar>
                          </Stack>
                        </Stack>
                      </Paper>
                    )
                  })}
                </Stack>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No head-to-head history found between these teams
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  )
}

export default HeadToHeadPage
