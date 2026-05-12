import React, { useState } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  Container,
  Stack,
  Avatar,
  Chip,
} from '@mui/material'
import {
  SportsEsports,
  CompareArrows,
  PersonSearch,
  AccountBalanceWallet,
} from '@mui/icons-material'
import MatchesPage from './pages/MatchesPage'
import HeadToHeadPage from './pages/HeadToHeadPage'
import PlayersPage from './pages/PlayersPage'
import MyBetsPage from './pages/MyBetsPage'

const navItems = [
  { path: '/', label: 'Matches', icon: <SportsEsports /> },
  { path: '/h2h', label: 'Head-to-Head', icon: <CompareArrows /> },
  { path: '/players', label: 'Players', icon: <PersonSearch /> },
  { path: '/bets', label: 'My Bets', icon: <AccountBalanceWallet /> },
]

function App() {
  const location = useLocation()
  const navigate = useNavigate()

  // Determine active tab from current path
  const getActiveTab = () => {
    const path = location.pathname
    const index = navItems.findIndex((item) => item.path === path)
    return index >= 0 ? index : 0
  }

  const [activeTab, setActiveTab] = useState(getActiveTab())

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    navigate(navItems[newValue].path)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ flexGrow: 1 }}
          >
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontWeight: 700,
                fontSize: '1rem',
              }}
            >
              LoL
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                Esports Dashboard
              </Typography>
              <Typography variant="caption" color="text.secondary">
                v1.0.0
              </Typography>
            </Box>
          </Stack>

          <Chip
            label="LIVE"
            size="small"
            color="error"
            sx={{
              fontWeight: 700,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.7 },
              },
            }}
          />
        </Toolbar>

        {/* Navigation Tabs */}
        <Box
          sx={{
            px: { xs: 2, sm: 3 },
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-flexContainer': {
                gap: 1,
              },
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: '3px 3px 0 0',
                bgcolor: 'primary.main',
              },
            }}
          >
            {navItems.map((item) => (
              <Tab
                key={item.path}
                label={item.label}
                icon={item.icon}
                iconPosition="start"
                sx={{
                  textTransform: 'none',
                  minHeight: 48,
                  px: 2,
                  fontWeight: 600,
                  color: 'text.secondary',
                  '&.Mui-selected': {
                    color: 'primary.main',
                  },
                  '& .MuiTab-iconWrapper': {
                    mr: 1,
                  },
                }}
              />
            ))}
          </Tabs>
        </Box>
      </AppBar>

      {/* Main Content */}
      <Container
        maxWidth="xl"
        sx={{
          py: 4,
          px: { xs: 2, sm: 3 },
        }}
      >
        <Routes>
          <Route path="/" element={<MatchesPage />} />
          <Route path="/h2h" element={<HeadToHeadPage />} />
          <Route path="/players" element={<PlayersPage />} />
          <Route path="/bets" element={<MyBetsPage />} />
        </Routes>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: { xs: 2, sm: 3 },
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              © 2026 LoL Esports Dashboard. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={3}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              >
                Privacy
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              >
                Terms
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
              >
                Contact
              </Typography>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </Box>
  )
}

export default App
