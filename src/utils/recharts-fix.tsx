import React from 'react';
import { YAxis as OriginalYAxis } from 'recharts';

// Solución temporal para el warning de defaultProps
const YAxis = (props: any) => {
  const mergedProps = {
    allowDataOverflow: false,
    allowDecimals: true,
    allowDuplicatedCategory: true,
    hide: false,
    orientation: 'left',
    mirror: false,
    reversed: false,
    scale: 'auto',
    tickCount: 5,
    type: 'number',
    ...props
  };

  return <OriginalYAxis {...mergedProps} />;
};

export default YAxis;