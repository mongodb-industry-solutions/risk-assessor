import React from 'react';
import PropTypes from 'prop-types';

const Avatar = ({ src }) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
    }}>
      <img src={src} alt="User Avatar" style={{ width: '400px', height: 'auto' }} />
    </div>
  );
};

Avatar.propTypes = {
  src: PropTypes.string.isRequired,
};

export default Avatar;