import Image from 'next/image';
import PropTypes from 'prop-types';

export default function DealCard({ title, imageUrl, price, dealLink }) {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '12px',
      padding: '16px',
      maxWidth: '300px',
      margin: '16px',
      textAlign: 'center',
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s',
      cursor: 'pointer'
    }}
    onClick={() => window.open(dealLink, '_blank')}
    >
      <Image src={imageUrl} alt={title} width={300} height={200} style={{ width: '100%', borderRadius: '8px' }} />
      <h2 style={{ fontSize: '1.2rem', margin: '12px 0' }}>{title}</h2>
      <p style={{ fontWeight: 'bold', fontSize: '1rem', color: '#ff6600' }}>{price}</p>
      <button style={{
        backgroundColor: '#ff6600',
        color: 'white',
        padding: '8px 16px',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        marginTop: '10px'
      }}>
        View Deal
      </button>
    </div>
  );
}

DealCard.propTypes = {
  title: PropTypes.string.isRequired,
  imageUrl: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  dealLink: PropTypes.string.isRequired,
};