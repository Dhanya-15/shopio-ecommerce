export const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Categories whose products need a size. "Women" covers dresses and clothing.
// To add another category later, just add its name here (and in server/routes/orders.js).
export const SIZED_CATEGORIES = ['Shoes', 'Women'];

export const needsSize = (p) => SIZED_CATEGORIES.includes(p.category);
