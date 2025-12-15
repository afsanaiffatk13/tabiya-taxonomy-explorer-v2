import { Routes, Route, Navigate } from 'react-router-dom';
import DataProvider from '@components/DataProvider';
import Layout from '@components/Layout';
import AboutPage from '@pages/AboutPage';
import OccupationsPage from '@pages/OccupationsPage';
import SkillsPage from '@pages/SkillsPage';

function App() {
  return (
    <DataProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/en/about" replace />} />
          <Route path=":lang">
            <Route index element={<Navigate to="about" replace />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="occupations/*" element={<OccupationsPage />} />
            <Route path="skills/*" element={<SkillsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/en/about" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  );
}

export default App;
