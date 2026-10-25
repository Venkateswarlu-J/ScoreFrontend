import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SocketProvider } from './context/SocketContext.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { CreateMatchPage } from './pages/CreateMatchPage.jsx';
import { MatchSetupPage } from './pages/MatchSetupPage.jsx';
import { ScorerPage } from './pages/ScorerPage.jsx';
import { LiveScorePage } from './pages/LiveScorePage.jsx';
import { MatchSummaryPage } from './pages/MatchSummaryPage.jsx';
import { CreateTournamentPage } from './pages/CreateTournamentPage.jsx';
import { TournamentPage } from './pages/TournamentPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/create" element={<CreateMatchPage />} />
          <Route path="/match/:matchId/setup" element={<MatchSetupPage />} />
          <Route path="/match/:matchId/score" element={<ScorerPage />} />
          <Route path="/match/:matchId" element={<LiveScorePage />} />
          <Route path="/match/:matchId/summary" element={<MatchSummaryPage />} />
          <Route path="/tournaments/create" element={<CreateTournamentPage />} />
          <Route path="/tournament/:id" element={<TournamentPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="top-center" />
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
