export type AmazonProduct = {
  asin: string;
  price?: number;
  currency?: string;
  title?: string;
  image?: string;
  ItemInfo?: {
    Title?: {
      DisplayValue?: string;
    };
  };
  Images?: {
    Primary?: {
      Medium?: {
        URL?: string;
      };
    };
  };
  Offers?: {
    Listings?: Array<{
      Price?: {
        Amount?: number;
        Currency?: string;
        DisplayAmount?: string;
        Savings?: {
          Amount?: number;
          Currency?: string;
          DisplayAmount?: string;
          Percentage?: number;
        };
      };
    }>;
  };
};