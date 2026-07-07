// Haversine formula to calculate distance between two coordinates in kilometers
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface RawProduce {
  id: string;
  farmer_id: string;
  name: string;
  category: string;
  price_per_unit: number;
  unit: string;
  quantity_available: number;
  harvest_date: string;
  freshness_tier: string;
  image_url: string;
  location_name: string;
  latitude: number;
  longitude: number;
  farmer?: {
    full_name: string;
    phone_number: string;
  };
}

export interface RawReview {
  reviewed_user_id: string;
  rating: number;
}

export interface RankedProduce extends RawProduce {
  distanceKm: number;
  freshnessScore: number;
  ratingScore: number;
  finalScore: number;
  farmerRating: number;
}

/**
 * Smart Recommendation Algorithm for Ashanti agricultural corridor.
 * Ranks produce based on freshness, distance, rating, and price.
 * 
 * Score Formula:
 * FinalScore = FreshnessScore + (RatingScore * 20) - (DistanceKm * 2) - (Price * 0.4)
 */
export function rankProduceListings(
  listings: RawProduce[],
  reviews: RawReview[],
  buyerLat: number,
  buyerLon: number
): RankedProduce[] {
  // 1. Calculate average rating for each farmer
  const farmerRatingMap: Record<string, { total: number; count: number }> = {};
  
  reviews.forEach((rev) => {
    if (!farmerRatingMap[rev.reviewed_user_id]) {
      farmerRatingMap[rev.reviewed_user_id] = { total: 0, count: 0 };
    }
    farmerRatingMap[rev.reviewed_user_id].total += rev.rating;
    farmerRatingMap[rev.reviewed_user_id].count += 1;
  });

  const getFarmerAverageRating = (farmerId: string): number => {
    const data = farmerRatingMap[farmerId];
    return data ? data.total / data.count : 4.2; // default to 4.2 stars for new/unreviewed farmers
  };

  // 2. Rank each listing
  const ranked = listings.map((item) => {
    // Proximity Distance
    const distanceKm = calculateDistance(buyerLat, buyerLon, item.latitude, item.longitude);

    // Freshness Tier Points
    let baseFreshnessPoints = 100;
    if (item.freshness_tier === "Good") baseFreshnessPoints = 75;
    else if (item.freshness_tier === "Fair") baseFreshnessPoints = 40;

    // Subtract points based on days since harvest (10 pts per day)
    const harvestDate = new Date(item.harvest_date);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - harvestDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) - 1;
    const freshnessScore = Math.max(10, baseFreshnessPoints - diffDays * 10);

    // Farmer Rating Score
    const farmerRating = getFarmerAverageRating(item.farmer_id);
    const ratingScore = farmerRating; // Rating stars (1 to 5)

    // Calculate overall recommendation score
    // Weight parameters: Proximity (closer is better), Freshness (fresher is better), Price (lower is better)
    const finalScore =
      freshnessScore +
      ratingScore * 18 -
      distanceKm * 2.5 -
      parseFloat(item.price_per_unit as any) * 0.35;

    return {
      ...item,
      distanceKm: Math.round(distanceKm * 10) / 10,
      freshnessScore,
      ratingScore,
      farmerRating: Math.round(farmerRating * 10) / 10,
      finalScore: Math.round(finalScore * 10) / 10,
    };
  });

  // Sort descending by recommendation score
  return ranked.sort((a, b) => b.finalScore - a.finalScore);
}
