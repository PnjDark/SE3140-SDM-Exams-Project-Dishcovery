import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

function RestaurantDetails() {
  const { id } = useParams();
  const [menu, setMenu] = useState([]);

  useEffect(() => {
    fetch(`/api/restaurants/${id}`)
      .then(res => res.json())
      .then(data => setMenu(data));
  }, [id]);

  if (menu.length === 0) return <p>Loading...</p>;

  const restaurant = menu[0];

   return (
    <div>
      <h2>{restaurant.name}</h2>
      <p>{restaurant.location}</p>

      <h3>Menu</h3>
      <ul>
        {menu.map((item, index) => (
          <li key={index}>
            {item.item} – ${item.price}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default RestaurantDetails;
