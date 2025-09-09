import React from 'react';
import { TaxTutorProvider } from './contexts/BizTutorContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <TaxTutorProvider>
        <Layout />
      </TaxTutorProvider>
    </ThemeProvider>
  );
}

export default App;