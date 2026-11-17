export function dashboardPathForRole(role) {
  switch (role) {
    case 'eoc':
    case 'admin':
      return '/eoc';
    case 'rescue_team':
      return '/rescue';
    case 'hospital':
      return '/hospital';
    case 'shelter':
      return '/shelter';
    default:
      return '/citizen';
  }
}
