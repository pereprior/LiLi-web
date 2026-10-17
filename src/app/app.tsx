import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { lazy, type ReactElement, Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router';

import { AppearanceSelector } from '#src/app/components/appearance/appearance-selector.js';
import { Brand } from '#src/app/components/branding/brand.js';
import { LoginScreen } from '#src/auth/components/login/login-screen.js';
import { useSession } from '#src/auth/hooks/session/use-session.js';

const TasksPage = lazy(() =>
  import('#src/tasks/components/page/tasks-page.js').then((module) => ({
    default: module.TasksPage,
  })),
);

export function App(): ReactElement {
  const session = useSession();
  const location = useLocation();

  return (
    <>
      <Box
        component="a"
        href="#main-content"
        sx={{
          position: 'absolute',
          left: -10000,
          top: 8,
          '&:focus': {
            left: 8,
            zIndex: 1500,
            bgcolor: 'background.paper',
            p: 2,
          },
        }}
      >
        Saltar al contenido
      </Box>
      <Container maxWidth="lg">
        <Stack
          component="header"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          sx={{
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', sm: 'center' },
            py: 3,
          }}
        >
          <Brand />
          <Stack
            direction="row"
            spacing={2}
            sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 1 }}
          >
            <AppearanceSelector />
            {session.state.status === 'authenticated' && (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ overflowWrap: 'anywhere' }}
                >
                  {session.state.user.email}
                </Typography>
                <Button
                  disabled={session.loggingOut}
                  onClick={() => void session.logout()}
                >
                  {session.loggingOut ? 'Cerrando sesión…' : 'Cerrar sesión'}
                </Button>
              </>
            )}
          </Stack>
        </Stack>
        <Divider />
        <Box component="main" id="main-content" sx={{ py: { xs: 3, sm: 5 } }}>
          {session.logoutError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {session.logoutError}
            </Alert>
          )}
          {session.state.status === 'checking' ? (
            <LoginScreen checking />
          ) : session.state.status === 'error' ? (
            <LoginScreen
              error={session.state.message}
              onRetry={session.checkSession}
            />
          ) : (
            <Routes>
              <Route
                path="/"
                element={
                  session.state.status === 'authenticated' ? (
                    <Suspense
                      fallback={
                        <Stack direction="row" spacing={2} role="status">
                          <CircularProgress size={24} />
                          <Typography>Abriendo tus tareas…</Typography>
                        </Stack>
                      }
                    >
                      <TasksPage
                        key={session.state.user.uuid}
                        email={session.state.user.email}
                        onUnauthorized={session.invalidateSession}
                      />
                    </Suspense>
                  ) : (
                    <Navigate
                      to={{ pathname: '/login', search: location.search }}
                      replace
                    />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  session.state.status === 'authenticated' ? (
                    <Navigate
                      to={{ pathname: '/', search: location.search }}
                      replace
                    />
                  ) : (
                    <LoginScreen />
                  )
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Box>
      </Container>
    </>
  );
}
