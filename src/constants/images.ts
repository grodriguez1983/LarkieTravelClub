export const Images = {
  larkie: {
    base: require('../../assets/images/larkie-base.png'),
    logo: require('../../assets/images/larkie-logo.png'),
    vacation: require('../../assets/images/larkie-vacation.png'),
    formal: require('../../assets/images/larkie-formal.png'),
    cocktail: require('../../assets/images/larkie-cocktail.png'),
    explorer: require('../../assets/images/larkie-explorer.png'),
    foodieBadge: require('../../assets/images/larkie-foodie-badge.png'),
  }
};

export const getLarkieImageForContext = (context: string, membershipLevel?: string) => {
  const hour = new Date().getHours();
  
  if (context === 'pool' || context === 'vacation') {
    return Images.larkie.vacation;
  }
  
  if (context === 'restaurant' || context === 'bar' || context === 'food') {
    return Images.larkie.cocktail;
  }
  
  if (context === 'formal' || context === 'vip' || membershipLevel === 'Legend') {
    return Images.larkie.formal;
  }
  
  if (context === 'exploration' || context === 'discovery') {
    return Images.larkie.explorer;
  }
  
  if (context === 'achievement' || context === 'badge') {
    return Images.larkie.foodieBadge;
  }
  
  // Default based on time of day
  if (hour >= 17 || hour <= 6) {
    return Images.larkie.formal; // Evening/night - more formal
  }
  
  return Images.larkie.base;
};