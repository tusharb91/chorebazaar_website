import DealCard from '../components/DealCard';

export default function DealsPage() {
  // Dummy Amazon deals for now
  const deals = [
    {
      title: 'Apple AirPods Pro (2nd Gen)',
      imageUrl: 'https://m.media-amazon.com/images/I/61f4b3cLr-L._AC_SL1500_.jpg',
      price: '₹22,499',
      dealLink: 'https://www.amazon.in/dp/B0BDHX8Z63'
    },
    {
      title: 'Sony WH-1000XM4 Wireless Headphones',
      imageUrl: 'https://m.media-amazon.com/images/I/71o8Q5XJS5L._AC_SL1500_.jpg',
      price: '₹26,990',
      dealLink: 'https://www.amazon.in/dp/B0863TXGM3'
    },
    {
      title: 'Samsung Galaxy S21 FE 5G',
      imageUrl: 'https://m.media-amazon.com/images/I/81mZ7yD+pxL._AC_SL1500_.jpg',
      price: '₹39,999',
      dealLink: 'https://www.amazon.in/dp/B09SH994JW'
    }
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>🔥 Live Amazon Deals 🔥</h1>

      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '16px'
      }}>
        {deals.map((deal, index) => (
          <DealCard
            key={index}
            title={deal.title}
            imageUrl={deal.imageUrl}
            price={deal.price}
            dealLink={deal.dealLink}
          />
        ))}
      </div>
    </div>
  );
}