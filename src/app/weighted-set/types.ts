export interface Fish {
  id: string;
  name: string;
  image: string;
}

export interface BagFish {
  fish: Fish;
  aggressiveness: number;
}

export interface Bag {
  id: number;
  fish: BagFish[];
}
