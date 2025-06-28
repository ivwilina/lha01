import React from 'react';
import Streak from '../../components/Streak';
import StreakDebug from '../../components/StreakDebug';
import '../../style/StreakPage.css';

const StreakPage = () => {
  return (
    <div className="streak-page">
      <div className="streak-page-container">
        <Streak />
        <div style={{ marginTop: '40px' }}>
          <StreakDebug />
        </div>
      </div>
    </div>
  );
};

export default StreakPage;
