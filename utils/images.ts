export const categoryImages: Record<string, string> = {
  tomatoes: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&q=80",
  pepper: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&q=80",
  "garden eggs": "https://images.unsplash.com/photo-1528825871115-3581a5387919?w=600&q=80",
  okra: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600&q=80",
  cabbage: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80",
  lettuce: "https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=600&q=80",
  spinach: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600&q=80",
  onions: "https://images.unsplash.com/photo-1620188467120-5042ed1eb5da?w=600&q=80",
};

export function getProduceImageUrl(category: string = "", dbUrl?: string): string {
  if (dbUrl && dbUrl.trim() !== "" && !dbUrl.includes("placeholder") && !dbUrl.includes("via.placeholder")) {
    return dbUrl;
  }
  const normalizedCategory = category.toLowerCase().trim();
  return categoryImages[normalizedCategory] || "https://images.unsplash.com/photo-1595855759920-86582396756a?w=600&q=80";
}
