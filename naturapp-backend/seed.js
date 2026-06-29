// seed.js — Poblar la base de datos con datos de ejemplo
// Uso: npm run seed
import mongoose from 'mongoose';
import Category from './models/Category.js';
import Product from './models/Product.js';
import User from './models/User.js';

const MONGODB_URI = process.env.MONGODB_URI
  || 'mongodb://localhost:27017/naturapp';

// ── Categorías (los nombres coinciden con los iconos de CategoryChips) ──
const categories = [
  { name: 'Superalimentos', icon: 'nutrition',
    description: 'Alimentos de alta densidad nutricional' },
  { name: 'Infusiones', icon: 'cafe',
    description: 'Tés e infusiones naturales' },
  { name: 'Suplementos', icon: 'fitness',
    description: 'Vitaminas y suplementos nutricionales' },
  { name: 'Cuidado Personal', icon: 'flower',
    description: 'Productos naturales para el cuidado del cuerpo' },
  { name: 'Snacks', icon: 'fast-food',
    description: 'Snacks saludables y naturales' },
];

// Plantilla de productos por nombre de categoría
const productsByCategory = {
  'Superalimentos': [
    { name: 'Maca Andina en Polvo 250g',
      description: 'Maca peruana orgánica, energizante natural rica en minerales.',
      price: 28.90, stock: 40,
      image: 'https://images.unsplash.com/photo-1610725664285-7c57e6eeac3f?w=600',
      tags: ['orgánico', 'energía'],
      nutritionalInfo: { calories: 91, protein: '14g', fiber: '8g' } },
    { name: 'Cacao Orgánico en Polvo 200g',
      description: 'Cacao puro andino sin azúcar, alto en antioxidantes.',
      price: 22.50, stock: 35,
      image: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=600',
      tags: ['antioxidante'],
      nutritionalInfo: { calories: 228, protein: '20g', fiber: '33g' } },
  ],
  'Infusiones': [
    { name: 'Té Verde Orgánico 25 bolsitas',
      description: 'Té verde natural antioxidante, ideal para el metabolismo.',
      price: 15.90, stock: 60,
      image: 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=600',
      tags: ['antioxidante', 'detox'],
      nutritionalInfo: { calories: 2, protein: '0g', fiber: '0g' } },
    { name: 'Infusión de Manzanilla 20 bolsitas',
      description: 'Manzanilla pura, relajante y digestiva.',
      price: 12.00, stock: 50,
      image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=600',
      tags: ['relajante'],
      nutritionalInfo: { calories: 1, protein: '0g', fiber: '0g' } },
  ],
  'Suplementos': [
    { name: 'Vitamina C 1000mg 60 cápsulas',
      description: 'Refuerza el sistema inmune con vitamina C natural.',
      price: 35.00, stock: 45,
      image: 'https://images.unsplash.com/photo-1550572017-edd951aa8ca7?w=600',
      tags: ['inmunidad'],
      nutritionalInfo: { calories: 5, protein: '0g', fiber: '0g' } },
    { name: 'Omega 3 Aceite de Pescado 90 perlas',
      description: 'Ácidos grasos esenciales para el corazón y el cerebro.',
      price: 42.90, stock: 30,
      image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600',
      tags: ['corazón'],
      nutritionalInfo: { calories: 10, protein: '0g', fiber: '0g' } },
  ],
  'Cuidado Personal': [
    { name: 'Jabón Artesanal de Avena 100g',
      description: 'Jabón natural hidratante con avena y aloe vera.',
      price: 9.90, stock: 70,
      image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=600',
      tags: ['natural'],
      nutritionalInfo: { calories: 0, protein: '0g', fiber: '0g' } },
    { name: 'Aceite de Coco Virgen 200ml',
      description: 'Aceite de coco prensado en frío para piel y cabello.',
      price: 19.90, stock: 55,
      image: 'https://images.unsplash.com/photo-1590005354167-6da97870c757?w=600',
      tags: ['hidratante'],
      nutritionalInfo: { calories: 120, protein: '0g', fiber: '0g' } },
  ],
  'Snacks': [
    { name: 'Mix de Frutos Secos 150g',
      description: 'Mezcla de almendras, nueces y pasas sin azúcar añadida.',
      price: 16.50, stock: 65,
      image: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?w=600',
      tags: ['snack', 'energía'],
      nutritionalInfo: { calories: 607, protein: '20g', fiber: '7g' } },
    { name: 'Chips de Plátano Horneados 100g',
      description: 'Snack crujiente de plátano natural, sin fritura.',
      price: 8.90, stock: 80,
      image: 'https://images.unsplash.com/photo-1599629954294-14df9ec8bc02?w=600',
      tags: ['snack'],
      nutritionalInfo: { calories: 519, protein: '2g', fiber: '8g' } },
  ],
};

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB conectado para seed');

    // Limpiar colecciones
    await Promise.all([
      Category.deleteMany({}),
      Product.deleteMany({}),
      User.deleteMany({ email: { $in: ['admin@naturapp.com', 'cliente@naturapp.com'] } }),
    ]);
    console.log('Colecciones limpiadas');

    // Insertar categorías
    const createdCategories = await Category.insertMany(categories);
    const catMap = {};
    createdCategories.forEach(c => { catMap[c.name] = c._id; });
    console.log(`${createdCategories.length} categorías insertadas`);

    // Insertar productos asociados a su categoría
    const allProducts = [];
    for (const [catName, prods] of Object.entries(productsByCategory)) {
      for (const p of prods) {
        allProducts.push({ ...p, category: catMap[catName] });
      }
    }
    const createdProducts = await Product.insertMany(allProducts);
    console.log(`${createdProducts.length} productos insertados`);

    // Usuarios de ejemplo (el hook pre-save hashea la contraseña)
    await User.create({
      name: 'Admin NaturApp', email: 'admin@naturapp.com',
      password: 'admin123', role: 'admin'
    });
    await User.create({
      name: 'Cliente Demo', email: 'cliente@naturapp.com',
      password: 'cliente123', role: 'customer'
    });
    console.log('Usuarios de ejemplo creados:');
    console.log('  admin@naturapp.com / admin123 (admin)');
    console.log('  cliente@naturapp.com / cliente123 (customer)');

    console.log('\n✅ Seed completado correctamente');
  } catch (error) {
    console.error('Error en seed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seed();
