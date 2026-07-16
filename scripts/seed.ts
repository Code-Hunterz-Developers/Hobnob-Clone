import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const serviceAccountPath = path.resolve(__dirname, 'serviceAccountKey.json');

if (!existsSync(serviceAccountPath)) {
  console.error(
    `Missing ${serviceAccountPath}\n\n` +
      'This script needs a Firebase service account key to write with admin privileges:\n' +
      '  1. Firebase Console -> Project Settings -> Service Accounts\n' +
      '  2. "Generate new private key"\n' +
      '  3. Save the downloaded file as scripts/serviceAccountKey.json (it is gitignored)\n' +
      '  4. Re-run: npm run seed\n' +
      '  5. You can delete the key file afterward if you like.',
  );
  process.exit(1);
}

const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

const app = initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore(app);
const imagesDir = path.resolve(__dirname, 'seed-assets/images');

// Firebase Storage requires the paid Blaze plan, so images are embedded
// directly in the Firestore doc as base64 data URLs instead (Firestore's
// per-document limit is 1MB — these seed photos are well under that).
function encodeImage(fileName: string): string {
  const filePath = path.join(imagesDir, fileName);
  const sizeKb = statSync(filePath).size / 1024;
  if (sizeKb > 700) {
    throw new Error(`${fileName} is ${sizeKb.toFixed(0)}KB — too large to inline safely, compress it first.`);
  }
  const buffer = readFileSync(filePath);
  return `data:image/jpeg;base64,${buffer.toString('base64')}`;
}

interface CategorySeed {
  name: string;
  slug: string;
  image: string;
}

interface ProductSeed {
  categorySlug: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number | null;
  image: string;
  tags: string[];
}

const categories: CategorySeed[] = [
  { name: 'Cakes', slug: 'cakes', image: 'category-cakes.jpg' },
  { name: 'Cupcakes', slug: 'cupcakes', image: 'category-cupcakes.jpg' },
  { name: 'Tarts', slug: 'tarts', image: 'category-tarts.jpg' },
  { name: 'Deal Boxes', slug: 'deal-boxes', image: 'category-deals.jpg' },
  { name: 'Cookies', slug: 'cookies', image: 'category-cookies.jpg' },
];

const products: ProductSeed[] = [
  // Cakes
  {
    categorySlug: 'cakes',
    name: 'Nutella Drip Cake',
    description:
      'Layers of moist chocolate sponge filled and glazed with silky Nutella ganache, finished with a hazelnut drip and crumble.',
    price: 3200,
    discountPrice: null,
    image: 'product-nutella-cake.jpg',
    tags: ['popular', 'new'],
  },
  {
    categorySlug: 'cakes',
    name: 'Classic Red Velvet Cake',
    description:
      'Our signature red velvet layers with a tangy cream cheese frosting, dusted with velvet crumbs.',
    price: 2800,
    discountPrice: 2400,
    image: 'product-red-velvet.jpg',
    tags: ['popular', 'deal'],
  },
  {
    categorySlug: 'cakes',
    name: 'Lotus Biscoff Cake',
    description:
      'Caramelized Biscoff sponge layered with spiced biscuit cream and topped with crushed Lotus cookies.',
    price: 3400,
    discountPrice: null,
    image: 'product-lotus-cake.jpg',
    tags: ['new'],
  },
  {
    categorySlug: 'cakes',
    name: 'Double Chocolate Fudge Cake',
    description:
      'Rich, fudgy chocolate cake soaked in cocoa syrup and covered in a glossy dark chocolate ganache.',
    price: 3000,
    discountPrice: null,
    image: 'product-choc-fudge.jpg',
    tags: ['popular'],
  },

  // Cupcakes
  {
    categorySlug: 'cupcakes',
    name: 'Double Chocolate Cupcake',
    description: 'Fudgy chocolate cupcake topped with a swirl of chocolate buttercream and cocoa dust.',
    price: 350,
    discountPrice: null,
    image: 'product-choc-cupcake.jpg',
    tags: ['popular'],
  },
  {
    categorySlug: 'cupcakes',
    name: 'Mango Cream Cupcake',
    description: 'Vanilla cupcake filled with fresh mango compote and topped with mango buttercream.',
    price: 380,
    discountPrice: null,
    image: 'product-mango-cupcake.jpg',
    tags: ['new'],
  },

  // Tarts
  {
    categorySlug: 'tarts',
    name: 'Fresh Fruit Tart',
    description:
      'Buttery tart shell filled with vanilla pastry cream and topped with a rainbow of fresh seasonal fruit.',
    price: 950,
    discountPrice: null,
    image: 'product-fruit-tart.jpg',
    tags: ['popular', 'new'],
  },
  {
    categorySlug: 'tarts',
    name: 'Pistachio Rose Tart',
    description:
      'Delicate tart shell with pistachio frangipane, rose-scented cream, and crushed pistachio topping.',
    price: 1100,
    discountPrice: null,
    image: 'product-pistachio-tart.jpg',
    tags: ['new'],
  },
  {
    categorySlug: 'tarts',
    name: 'Lotus Biscoff Tart',
    description:
      'Crunchy Biscoff crust filled with spiced caramel custard and finished with a whole Lotus cookie.',
    price: 1000,
    discountPrice: null,
    image: 'product-lotus-tart.jpg',
    tags: ['popular', 'new'],
  },

  // Cookies
  {
    categorySlug: 'cookies',
    name: 'Fudge Brownie',
    description: 'Dense, chewy brownie loaded with dark chocolate chunks and a crackly top.',
    price: 300,
    discountPrice: null,
    image: 'product-brownie.jpg',
    tags: ['popular'],
  },
  {
    categorySlug: 'cookies',
    name: 'Oatmeal Raisin Cookie',
    description: 'Chewy oatmeal cookie packed with plump raisins and a hint of cinnamon.',
    price: 220,
    discountPrice: null,
    image: 'product-oat-cookie.jpg',
    tags: [],
  },
  {
    categorySlug: 'cookies',
    name: 'Assorted Cookie Jar',
    description: "A jar filled with our best-selling cookie flavors, perfect for sharing or gifting.",
    price: 1800,
    discountPrice: 1500,
    image: 'product-cookie-jar.jpg',
    tags: ['deal'],
  },

  // Deal Boxes
  {
    categorySlug: 'deal-boxes',
    name: 'The Workshop Deal Box',
    description:
      'A curated selection of our best-selling cupcakes and tarts, boxed beautifully for gifting or hoarding.',
    price: 2200,
    discountPrice: 1800,
    image: 'product-deal-box-1.jpg',
    tags: ['deal', 'popular', 'deal-box'],
  },
  {
    categorySlug: 'deal-boxes',
    name: 'Sweet Sampler Box',
    description:
      'Six mini treats spanning cakes, tarts, and cookies — the perfect way to try a bit of everything.',
    price: 1900,
    discountPrice: 1600,
    image: 'product-deal-box-2.jpg',
    tags: ['deal', 'new', 'deal-box'],
  },
];

async function seed() {
  const existing = await db.collection('categories').limit(1).get();
  if (!existing.empty) {
    console.log('Categories collection is not empty — seed already ran. Aborting to avoid duplicates.');
    console.log('Clear the categories/products collections in the Firebase console first if you want to reseed.');
    return;
  }

  console.log('Encoding images...');
  const imageUrlByFile = new Map<string, string>();
  const allFiles = new Set([...categories.map((c) => c.image), ...products.map((p) => p.image)]);
  for (const file of allFiles) {
    imageUrlByFile.set(file, encodeImage(file));
    console.log(`Encoded ${file}`);
  }

  console.log('Seeding categories...');
  const categoryIdBySlug = new Map<string, string>();
  for (const c of categories) {
    const ref = await db.collection('categories').add({
      name: c.name,
      slug: c.slug,
      imageUrl: imageUrlByFile.get(c.image)!,
    });
    categoryIdBySlug.set(c.slug, ref.id);
  }

  console.log('Seeding products...');
  for (const p of products) {
    await db.collection('products').add({
      categoryId: categoryIdBySlug.get(p.categorySlug)!,
      categorySlug: p.categorySlug,
      name: p.name,
      description: p.description,
      price: p.price,
      discountPrice: p.discountPrice,
      imageUrl: imageUrlByFile.get(p.image)!,
      tags: p.tags,
    });
  }

  console.log('Seed complete.');
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
