export const categoryImages: Record<string, string> = {
  tomatoes: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&q=80",
  pepper: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80",
  "garden eggs": "https://images.unsplash.com/photo-1590377486603-51829e160e1d?w=600&q=80",
  okra: "https://images.unsplash.com/photo-1623910393282-3db53fb16eb0?w=600&q=80",
  cabbage: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80",
  lettuce: "https://images.unsplash.com/photo-1622484211148-71700ccf0857?w=600&q=80",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80",
  onions: "https://images.unsplash.com/photo-1508747703725-719ae25db29f?w=600&q=80",
};

export function getProduceImageUrl(category: string = "", dbUrl?: string): string {
  if (dbUrl && dbUrl.trim() !== "" && !dbUrl.includes("placeholder") && !dbUrl.includes("via.placeholder")) {
    return dbUrl;
  }
  const normalizedCategory = category.toLowerCase().trim();
  return categoryImages[normalizedCategory] || "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&q=80";
}
