import React from 'react';
import { TrustIndicator } from './ui/Indicators.jsx';

export default function TrustBadge({ verification, dark = false }) {
  return <TrustIndicator verification={verification} dark={dark} />;
}
