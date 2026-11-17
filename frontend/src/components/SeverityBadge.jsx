import React from 'react';
import { SeverityIndicator } from './ui/Indicators.jsx';

export default function SeverityBadge({ severity = 'medium', pulse = false, dark = false }) {
  return <SeverityIndicator severity={severity} pulse={pulse} dark={dark} />;
}
