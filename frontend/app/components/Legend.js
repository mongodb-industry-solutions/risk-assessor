// Legend.js
import React from 'react';
import { H3, Body } from '@leafygreen-ui/typography';

const yearColors = {
  "Input": 'Gray',
  2016: 'Blue',
  2017: 'Green',
  2018: 'Yellow',
  2019: 'Orange',
  2020: 'Red',
};

const Legend = () => {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      {/*<H3>Legend:</H3>*/}
      {Object.entries(yearColors).map(([year, color]) => (
        <div key={year} style={{ display: 'flex', alignItems: 'center'}}>
          <div style={{
            width: '15px',
            height: '15px',
            backgroundColor: color,
            borderRadius: '50%', 
            boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
            margin: '0px 5px'
          }}></div>          
          <Body>{year}</Body>
        </div>
      ))}
      <div style={{
        width: '14px',
        height: '14px',
        backgroundColor: 'lightblue',
        borderRadius: '50%', 
        border: '2px solid blue',  
        boxShadow: '0px 0px 5px rgba(0, 0, 0, 0.1)',
        margin: '0px 5px'
      }}></div>          
      <Body>5 km / 3.1 mi</Body> 
    </div>
  );
};

export default Legend;