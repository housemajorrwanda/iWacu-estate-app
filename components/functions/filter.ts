import { url } from "@/url";

interface FilterOptions {
  price?: number;
  priceMax?:number
  choosenHouseType?: string;
  houseCategory:string,
  active_payment_category?: string;
  features?: string[]; // if you're adding features later
}

export default async function filterHousesFromAPI({
  price,
  priceMax,
  choosenHouseType,
  houseCategory,
  active_payment_category,
  features,
}: FilterOptions): Promise<any> {
  const query = new URLSearchParams();
  console.log(price,active_payment_category)
  // ✅ Price
  const maxPrice = priceMax ?? price;
  if (maxPrice && maxPrice > 0) {
    query.append("price_max", maxPrice.toString());
  }

  // ✅ Category (ONLY ONE)
  const category = houseCategory || choosenHouseType;
  if (category) {
    query.append("house_category", category);
  }

  // ✅ Payment
  if (active_payment_category) {
    query.append("payment_category", active_payment_category);
  }

  // ✅ Features (UUID or UUID:4)
  if (features?.length) {
    features.forEach((f) => query.append("features", f));
  }
console.log('url',`${url}/api/houses/?${query.toString()}`)
  const response = await fetch(`${url}/api/houses/?${query.toString()}`);
  return await response.json();
}
