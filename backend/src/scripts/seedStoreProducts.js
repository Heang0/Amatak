import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import connectDB from '../config/db.js';
import Store from '../models/Store.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

const seedData = async () => {
  try {
    await connectDB();

    const store = await Store.findOne({ slug: 'momentum' });
    if (!store) {
      console.error('Store "momentum" not found!');
      process.exit(1);
    }

    console.log(`Found store: ${store.name} (${store._id})`);

    // 1. Create or get categories
    const categoriesData = [
      { name: 'Fashion & Apparel', nameKm: 'សម្លៀកបំពាក់ & ម៉ូដ', slug: 'fashion-apparel' },
      { name: 'Shoes & Footwear', nameKm: 'ស្បែកជើង & ម៉ូដទាន់សម័យ', slug: 'shoes-footwear' },
      { name: 'Electronics & Audio', nameKm: 'គ្រឿងអេឡិចត្រូនិច & សំឡេង', slug: 'electronics-audio' },
      { name: 'Accessories & Watches', nameKm: 'នាឡិកា & គ្រឿងតុបតែង', slug: 'accessories-watches' },
      { name: 'Bags & Backpacks', nameKm: 'កាបូប & កាបូបស្ពាយ', slug: 'bags-backpacks' },
    ];

    const categoryMap = {};
    for (const cat of categoriesData) {
      let existing = await Category.findOne({ storeId: store._id, slug: cat.slug });
      if (!existing) {
        existing = await Category.create({
          storeId: store._id,
          name: cat.name,
          nameKm: cat.nameKm,
          slug: cat.slug,
        });
        console.log(`Created category: ${cat.name}`);
      } else {
        existing.nameKm = cat.nameKm;
        await existing.save();
      }
      categoryMap[cat.slug] = existing._id;
    }

    // 2. Prepare sample products
    const sampleProducts = [
      {
        title: 'Minimalist Oversized Cotton Hoodie',
        titleKm: 'អាវរងាដៃវែងកប្បាសម៉ូតទាន់សម័យ (Oversized Hoodie)',
        slug: 'minimalist-oversized-cotton-hoodie',
        categorySlug: 'fashion-apparel',
        price: 38.00,
        stock: 65,
        sku: 'MMT-HD-001',
        barcode: '885901234001',
        description: 'Premium heavyweight French Terry cotton hoodie with dropped shoulders, kangaroo pocket, and clean ribbed trims. Ultra-soft interior.',
        descriptionKm: 'អាវរងាកប្បាសគុណភាពខ្ពស់ សាច់ក្រាស់ទន់ល្មើយ ផ្តល់នូវផាសុកភាពខ្ពស់ និងរចនាបថទាន់សម័យ។',
        imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?w=800&auto=format&fit=crop&q=80',
        ],
        variants: [
          { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
          { name: 'Color', options: ['Charcoal Black', 'Oatmeal Beige', 'Sage Green'] }
        ],
        isBestSeller: true,
        isFeatured: true,
      },
      {
        title: 'Vintage Washed Heavyweight Tee',
        titleKm: 'អាវយឺតដៃខ្លីកប្បាសបែបបុរាណ (Vintage Washed Tee)',
        slug: 'vintage-washed-heavyweight-tee',
        categorySlug: 'fashion-apparel',
        price: 22.00,
        stock: 120,
        sku: 'MMT-TS-002',
        barcode: '885901234002',
        description: '240 GSM organic cotton t-shirt with a relaxed boxy fit, reinforced collar, and vintage garment-dye finish.',
        descriptionKm: 'អាវយឺតកប្បាសសាច់ក្រាស់ ២៤០ GSM ម៉ូតបែប Vintage ងាយស្រួលពាក់ និងមិនបែកសាច់ក្រណាត់។',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Size', options: ['S', 'M', 'L', 'XL'] },
          { name: 'Color', options: ['Washed Black', 'Vintage White', 'Faded Navy'] }
        ],
        isBestSeller: true,
        isFeatured: false,
      },
      {
        title: 'Tactical Cargo Pants with Quick-Release Straps',
        titleKm: 'ខោខូវប៊យបែប Tactical ហោប៉ៅច្រើន',
        slug: 'tactical-cargo-pants',
        categorySlug: 'fashion-apparel',
        price: 45.00,
        stock: 45,
        sku: 'MMT-CG-003',
        barcode: '885901234003',
        description: 'Water-resistant ripstop cargo pants featuring adjustable ankle toggles, ergonomic pockets, and heavy-duty zipper.',
        descriptionKm: 'ខោខូវប៊យការពារទឹក សាច់ស្វិតជាប់ធន់ ងាយស្រួលធ្វើចលនា និងមានហោប៉ៅធំៗជាច្រើន។',
        imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Size', options: ['28', '30', '32', '34'] },
          { name: 'Color', options: ['Black', 'Olive Green', 'Khaki'] }
        ],
        isBestSeller: false,
        isFeatured: true,
      },
      {
        title: 'Retro High-Top Streetwear Sneakers',
        titleKm: 'ស្បែកជើងប៉ាតាកវែង Retro High-Top',
        slug: 'retro-high-top-streetwear-sneakers',
        categorySlug: 'shoes-footwear',
        price: 79.00,
        stock: 35,
        sku: 'MMT-SN-004',
        barcode: '885901234004',
        description: 'Classic court silhouette featuring premium leather overlays, cushioned Air-foam sole, and anti-slip rubber traction.',
        descriptionKm: 'ស្បែកជើងប៉ាតាស្បែកសុទ្ធ កវែងស្ទីល Retro បាតទន់ស្រាល និងមានកម្លាំងទប់លំនឹងល្អ។',
        imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1607522370275-f14206abe5d3?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Size', options: ['EU 40', 'EU 41', 'EU 42', 'EU 43', 'EU 44'] },
          { name: 'Color', options: ['Chicago Red/White', 'Panda Black/White'] }
        ],
        isBestSeller: true,
        isFeatured: true,
      },
      {
        title: 'CloudWalk Ultralight Running Shoes',
        titleKm: 'ស្បែកជើងរត់ CloudWalk ទម្ងន់ស្រាលខ្យល់',
        slug: 'cloudwalk-ultralight-running-shoes',
        categorySlug: 'shoes-footwear',
        price: 64.00,
        stock: 50,
        sku: 'MMT-SN-005',
        barcode: '885901234005',
        description: 'Engineered mesh upper for maximum breathability with responsive energy-return foam cushioning for effortless strides.',
        descriptionKm: 'ស្បែកជើងរត់ប្រណាំងសាច់សំណាញ់បញ្ចេញខ្យល់ បាតអេប៉ុងទន់លោតស្រួល មិនឈឺជើងពេលដើរយូរ។',
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Size', options: ['EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 43'] },
          { name: 'Color', options: ['Fire Red', 'Triple Black', 'Glacier White'] }
        ],
        isBestSeller: true,
        isFeatured: false,
      },
      {
        title: 'Active Noise Cancelling Wireless Headphones',
        titleKm: 'កាសប៊្លូធូសឥតខ្សែ កាត់បន្ថយសំឡេងរំខាន (ANC Headphones)',
        slug: 'anc-wireless-headphones',
        categorySlug: 'electronics-audio',
        price: 89.00,
        stock: 40,
        sku: 'MMT-EL-006',
        barcode: '885901234006',
        description: 'Immersive sound with 40mm titanium drivers, active noise cancellation up to 35dB, and 45-hour battery life.',
        descriptionKm: 'កាសត្រចៀកឥតខ្សែបច្ចេកវិទ្យាកាត់បន្ថយសំឡេងរំខានកម្រិតខ្ពស់ សំឡេងបាសពិរោះ និងថ្មកាន់បានរហូតដល់ ៤៥ ម៉ោង។',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Color', options: ['Midnight Black', 'Matte Silver', 'Rose Gold'] }
        ],
        isBestSeller: true,
        isFeatured: true,
      },
      {
        title: 'True Wireless Gaming Earbuds with Low Latency',
        titleKm: 'កាសត្រចៀកហ្គេមប៊្លូធូសឥតខ្សែ (Gaming Earbuds)',
        slug: 'tws-gaming-earbuds',
        categorySlug: 'electronics-audio',
        price: 35.00,
        stock: 80,
        sku: 'MMT-EL-007',
        barcode: '885901234007',
        description: '45ms ultra-low latency gaming mode, dual environmental noise-cancelling mics, RGB breathing light case, and IPX5 water resistance.',
        descriptionKm: 'កាសត្រចៀកឥតខ្សែសម្រាប់លេងហ្គេម និងស្តាប់ចម្រៀង គ្មានភាពយឺតយ៉ាវ (Low Latency) និងភ្លើង RGB ស្រស់ស្អាត។',
        imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Color', options: ['Neon Black', 'Cyber White'] }
        ],
        isBestSeller: false,
        isFeatured: false,
      },
      {
        title: 'Minimalist Automatic Mechanical Watch',
        titleKm: 'នាឡិកាដៃស្វ័យប្រវត្តិកញ្ចក់ត្បូងកណ្តៀង (Mechanical Watch)',
        slug: 'minimalist-automatic-mechanical-watch',
        categorySlug: 'accessories-watches',
        price: 135.00,
        stock: 20,
        sku: 'MMT-WA-008',
        barcode: '885901234008',
        description: 'Self-winding Japanese automatic movement, sapphire crystal scratch-resistant glass, and genuine Italian leather strap. 50M waterproof.',
        descriptionKm: 'នាឡិកាដៃស្វ័យប្រវត្តិកម្រិតប្រណិត កញ្ចក់ Sapphire មិនឆ្កូត ខ្សែស្បែកអ៊ីតាលី និងការពារជម្រៅទឹក ៥០ម៉ែត្រ។',
        imageUrl: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Strap', options: ['Dark Brown Leather', 'Obsidian Black Leather', 'Mesh Steel'] }
        ],
        isBestSeller: true,
        isFeatured: true,
      },
      {
        title: 'Polarized Aviator Sunglasses UV400',
        titleKm: 'វ៉ែនតាការពារកម្ដៅថ្ងៃ Polarized UV400',
        slug: 'polarized-aviator-sunglasses',
        categorySlug: 'accessories-watches',
        price: 26.00,
        stock: 90,
        sku: 'MMT-AC-009',
        barcode: '885901234009',
        description: 'Ultralight stainless steel frame with TAC polarized lenses offering 100% UV400 protection against glare and harmful rays.',
        descriptionKm: 'វ៉ែនតាការពារកម្ដៅថ្ងៃ Polarized ការពារកាំរស្មីយូវី ១០០% ជើងដែកស្រាលរឹងមាំ ទាន់សម័យ។',
        imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Frame Color', options: ['Gold Frame / Green Lens', 'Black Frame / Dark Lens', 'Silver Frame / Blue Lens'] }
        ],
        isBestSeller: false,
        isFeatured: false,
      },
      {
        title: 'Waterproof Commuter Laptop Backpack (25L)',
        titleKm: 'កាបូបស្ពាយកុំព្យូទ័រការពារទឹក (Commuter Backpack)',
        slug: 'waterproof-commuter-laptop-backpack',
        categorySlug: 'bags-backpacks',
        price: 49.00,
        stock: 55,
        sku: 'MMT-BG-010',
        barcode: '885901234010',
        description: 'Durable Oxford fabric with padded compartment fitting up to 16-inch laptops, external USB charging port, and anti-theft hidden pocket.',
        descriptionKm: 'កាបូបស្ពាយខ្នងការពារទឹក ដាក់កុំព្យូទ័របានដល់ ១៦ អ៊ីញ មានរន្ធសាកថ្ម USB និងហោប៉ៅសុវត្ថិភាព។',
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Color', options: ['Charcoal Gray', 'Matte Black', 'Navy Blue'] }
        ],
        isBestSeller: true,
        isFeatured: true,
      },
      {
        title: 'Minimalist Leather Cardholder Wallet',
        titleKm: 'កាបូបដាក់កាតស្បែកសុទ្ធ (Leather Cardholder)',
        slug: 'minimalist-leather-cardholder-wallet',
        categorySlug: 'accessories-watches',
        price: 18.00,
        stock: 110,
        sku: 'MMT-WL-011',
        barcode: '885901234011',
        description: 'Full-grain leather slim cardholder with RFID blocking protection, 6 card slots, and central cash compartment.',
        descriptionKm: 'កាបូបដាក់កាតស្បែកសុទ្ធ ស្តើងតូចល្មមងាយស្រួលដាក់តាមខ្លួន ការពារការលួចស្កេន RFID។',
        imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Color', options: ['Crazy Horse Brown', 'Classic Black', 'Tan'] }
        ],
        isBestSeller: false,
        isFeatured: false,
      },
      {
        title: 'Smart Fitness Tracker & Heart Rate Watch',
        titleKm: 'នាឡិកាឆ្លាតវៃតាមដានសុខភាព Smart Fitness Watch',
        slug: 'smart-fitness-tracker-watch',
        categorySlug: 'electronics-audio',
        price: 52.00,
        stock: 60,
        sku: 'MMT-SM-012',
        barcode: '885901234012',
        description: '1.8-inch AMOLED display, SpO2 blood oxygen monitor, 120+ sports modes, sleep analysis, and 14-day battery backup.',
        descriptionKm: 'នាឡិកាឆ្លាតវៃអេក្រង់ AMOLED តាមដានសុខភាព ចង្វាក់បេះដូង កម្រិតអុកស៊ីសែន និងថាមពលថ្មប្រើបាន ១៤ ថ្ងៃ។',
        imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80'
        ],
        variants: [
          { name: 'Band Color', options: ['Space Gray', 'Obsidian Black', 'Midnight Blue'] }
        ],
        isBestSeller: true,
        isFeatured: true,
      }
    ];

    console.log('Clearing old products for clean seed...');
    await Product.deleteMany({ storeId: store._id });

    for (const p of sampleProducts) {
      const categoryId = categoryMap[p.categorySlug] || Object.values(categoryMap)[0];
      await Product.create({
        storeId: store._id,
        category: categoryId,
        title: p.title,
        titleKm: p.titleKm,
        slug: p.slug,
        description: p.description,
        descriptionKm: p.descriptionKm,
        price: p.price,
        stock: p.stock,
        sku: p.sku,
        barcode: p.barcode,
        imageUrl: p.imageUrl,
        images: p.images,
        variants: p.variants,
        isBestSeller: p.isBestSeller,
        isFeatured: p.isFeatured,
      });
      console.log(`✓ Added product: ${p.title} ($${p.price})`);
    }

    console.log(`\n🎉 Successfully seeded ${sampleProducts.length} products and ${categoriesData.length} categories for Momentum!`);
    process.exit(0);

  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
