export const categoryImages: Record<string, string> = {
  tomatoes: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&q=80",
  pepper: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80",
  "garden eggs": "https://images.unsplash.com/photo-1590523277543-a94d2e4eb00b?w=600&q=80",
  okra: "https://images.unsplash.com/photo-1625938146369-adc83368bda7?w=600&q=80",
  cabbage: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?w=600&q=80",
  lettuce: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=600&q=80",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80",
  onions: "https://images.unsplash.com/photo-1618519764620-7403abdbfee9?w=600&q=80",
};

export function getProduceImageUrl(category: string = "", dbUrl?: string): string {
  if (dbUrl && dbUrl.trim() !== "" && !dbUrl.includes("placeholder") && !dbUrl.includes("via.placeholder")) {
    return dbUrl;
  }
  const normalizedCategory = category.toLowerCase().trim();
  return categoryImages[normalizedCategory] || "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&q=80";
}
