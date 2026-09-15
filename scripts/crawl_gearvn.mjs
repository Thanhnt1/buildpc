/**
 * Crawler tự động cào TOÀN BỘ linh kiện thực tế từ GearVN theo danh mục + phân trang.
 * Trích xuất: Tên, Hãng, Giá thực tế, Ảnh chất lượng cao (CDN hstatic), và Specs chi tiết.
 * Xuất file: `seed_gearvn_full.sql`
 */

import fs from 'fs';
import path from 'path';

const COLLECTIONS = [
  { category: 'cpu', handle: 'cpu-bo-vi-xu-ly', maxPages: 4 },
  { category: 'mainboard', handle: 'mainboard-bo-mach-chu', maxPages: 6 },
  { category: 'ram', handle: 'ram-pc', maxPages: 6 },
  { category: 'gpu', handle: 'vga-card-man-hinh', maxPages: 6 },
  { category: 'psu', handle: 'psu-nguon-may-tinh', maxPages: 5 },
  { category: 'case', handle: 'case-thung-may-tinh', maxPages: 8 },
  { category: 'cooler', handle: 'tan-nhiet-may-tinh', maxPages: 6 },
  { category: 'storage', handle: 'ssd-o-cung-the-ran', maxPages: 6 },
  { category: 'storage', handle: 'hdd-o-cung-pc', maxPages: 3 },
];

function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''").trim();
}

function cleanPrice(priceStr) {
  if (!priceStr) return 0;
  const num = priceStr.replace(/[^0-9]/g, '');
  return parseInt(num, 10) || 0;
}

function inferBrand(title) {
  const t = title.toUpperCase();
  if (t.includes('INTEL')) return 'Intel';
  if (t.includes('AMD') || t.includes('RYZEN')) return 'AMD';
  if (t.includes('ASUS') || t.includes('ROG') || t.includes('TUF')) return 'ASUS';
  if (t.includes('MSI')) return 'MSI';
  if (t.includes('GIGABYTE') || t.includes('AORUS')) return 'Gigabyte';
  if (t.includes('ASROCK')) return 'ASRock';
  if (t.includes('COLORFUL')) return 'Colorful';
  if (t.includes('CORSAIR')) return 'Corsair';
  if (t.includes('KINGSTON') || t.includes('FURY')) return 'Kingston';
  if (t.includes('G.SKILL') || t.includes('TRIDENT') || t.includes('RIPJAWS')) return 'G.Skill';
  if (t.includes('TEAMGROUP') || t.includes('TEAM GROUP') || t.includes('T-FORCE') || t.includes('T-CREATE')) return 'TeamGroup';
  if (t.includes('ADATA') || t.includes('XPG')) return 'Adata';
  if (t.includes('KINGMAX')) return 'Kingmax';
  if (t.includes('KLEVV')) return 'Klevv';
  if (t.includes('PATRIOT')) return 'Patriot';
  if (t.includes('SAMSUNG')) return 'Samsung';
  if (t.includes('WESTERN DIGITAL') || t.includes('WD') || t.includes('SANDISK')) return 'WD';
  if (t.includes('SEAGATE')) return 'Seagate';
  if (t.includes('CRUCIAL')) return 'Crucial';
  if (t.includes('KIOXIA')) return 'Kioxia';
  if (t.includes('LEXAR')) return 'Lexar';
  if (t.includes('PNY')) return 'PNY';
  if (t.includes('ZOTAC')) return 'Zotac';
  if (t.includes('PALIT')) return 'Palit';
  if (t.includes('SAPPHIRE')) return 'Sapphire';
  if (t.includes('POWERCOLOR')) return 'PowerColor';
  if (t.includes('LEADTEK')) return 'Leadtek';
  if (t.includes('SPARKLE')) return 'Sparkle';
  if (t.includes('DEEPCOOL')) return 'Deepcool';
  if (t.includes('THERMALRIGHT')) return 'Thermalright';
  if (t.includes('COOLER MASTER')) return 'Cooler Master';
  if (t.includes('NZXT')) return 'NZXT';
  if (t.includes('LIAN LI') || t.includes('LIAN-LI')) return 'Lian Li';
  if (t.includes('XIGMATEK')) return 'Xigmatek';
  if (t.includes('MONTECH')) return 'Montech';
  if (t.includes('JONSBO')) return 'Jonsbo';
  if (t.includes('MIK')) return 'Mik';
  if (t.includes('FRACTAL') || t.includes('FRACTAL DESIGN')) return 'Fractal Design';
  if (t.includes('TRYX')) return 'TRYX';
  if (t.includes('FSP')) return 'FSP';
  if (t.includes('SEASONIC')) return 'Seasonic';
  if (t.includes('SUPER FLOWER')) return 'Super Flower';
  if (t.includes('SILVERSTONE')) return 'SilverStone';
  if (t.includes('ANTEC')) return 'Antec';
  if (t.includes('ID-COOLING') || t.includes('ID COOLING')) return 'ID-Cooling';
  if (t.includes('NOCTUA')) return 'Noctua';
  if (t.includes('VALKYRIE')) return 'Valkyrie';
  return 'Khác';
}

function inferSpecs(category, title, extractedChips = []) {
  const t = title.toUpperCase();
  const chipsText = extractedChips.join(' ').toUpperCase();
  const fullText = `${t} ${chipsText}`;

  if (category === 'cpu') {
    let socket = 'LGA1700';
    let ram_type = 'DDR4/DDR5';
    let tdp_w = 65;
    let cores = 6;
    let threads = 12;
    let integrated_graphics = !t.includes('F') && !t.includes('KF');

    if (fullText.includes('1851') || fullText.includes('ULTRA') || fullText.includes('245') || fullText.includes('265') || fullText.includes('285')) {
      socket = 'LGA1851';
      ram_type = 'DDR5';
      tdp_w = 125;
    } else if (fullText.includes('AM5') || fullText.includes('7500') || fullText.includes('7600') || fullText.includes('7700') || fullText.includes('7800') || fullText.includes('7900') || fullText.includes('7950') || fullText.includes('9600') || fullText.includes('9700') || fullText.includes('9800') || fullText.includes('9900') || fullText.includes('9950') || fullText.includes('8400') || fullText.includes('8500') || fullText.includes('8600') || fullText.includes('8700')) {
      socket = 'AM5';
      ram_type = 'DDR5';
      tdp_w = fullText.includes('9950') || fullText.includes('7950') ? 170 : (fullText.includes('X3D') ? 120 : 65);
      integrated_graphics = !t.includes('F');
    } else if (fullText.includes('AM4') || fullText.includes('5600') || fullText.includes('5700') || fullText.includes('5800') || fullText.includes('5900') || fullText.includes('5950') || fullText.includes('3600') || fullText.includes('3200') || fullText.includes('3000')) {
      socket = 'AM4';
      ram_type = 'DDR4';
      tdp_w = 65;
      integrated_graphics = t.includes('G');
    }

    const matchCores = fullText.match(/(\d+)\s*(?:NHÂN|CORES)/i);
    if (matchCores) cores = parseInt(matchCores[1], 10);
    const matchThreads = fullText.match(/(\d+)\s*(?:LUỒNG|THREADS)/i);
    if (matchThreads) threads = parseInt(matchThreads[1], 10);

    return { socket, tdp_w, ram_type, cores, threads, integrated_graphics };
  }

  if (category === 'mainboard') {
    let socket = 'LGA1700';
    let form_factor = 'mATX';

    if (fullText.includes('Z890') || fullText.includes('B860') || fullText.includes('1851')) socket = 'LGA1851';
    else if (fullText.includes('B650') || fullText.includes('X670') || fullText.includes('A620') || fullText.includes('X870') || fullText.includes('B850') || fullText.includes('AM5')) socket = 'AM5';
    else if (fullText.includes('B550') || fullText.includes('A520') || fullText.includes('B450') || fullText.includes('X570') || fullText.includes('AM4')) socket = 'AM4';
    else socket = 'LGA1700';

    let ram_type = 'DDR5';
    if (socket === 'AM4') {
      ram_type = 'DDR4';
    } else if (socket === 'LGA1851' || socket === 'AM5') {
      ram_type = 'DDR5';
    } else {
      // LGA1700
      ram_type = (fullText.includes('DDR4') || fullText.includes('D4')) ? 'DDR4' : 'DDR5';
    }

    let max_ram_mhz = ram_type === 'DDR5' ? 6000 : 3200;

    if (fullText.includes('ITX') || fullText.includes('-I ')) form_factor = 'ITX';
    else if (fullText.includes(' E-ATX') || fullText.includes('EATX')) form_factor = 'ATX';
    else if (fullText.includes(' ATX') && !fullText.includes('MATX') && !fullText.includes('M-') && !fullText.includes('M ')) form_factor = 'ATX';
    else form_factor = 'mATX';

    return {
      socket,
      form_factor,
      ram_type,
      max_ram_mhz,
      ram_slots: form_factor === 'ITX' ? 2 : 4,
      m2_slots: socket === 'LGA1851' || socket === 'AM5' ? 3 : 2,
      sata_slots: 4
    };
  }

  if (category === 'ram') {
    const isDdr4 = fullText.includes('DDR4') || fullText.includes('D4');
    const type = isDdr4 ? 'DDR4' : 'DDR5';
    let speed_mhz = isDdr4 ? 3200 : 5600;
    if (fullText.includes('3600')) speed_mhz = 3600;
    else if (fullText.includes('6000')) speed_mhz = 6000;
    else if (fullText.includes('6400')) speed_mhz = 6400;
    else if (fullText.includes('6600')) speed_mhz = 6600;
    else if (fullText.includes('7200')) speed_mhz = 7200;

    let modules = fullText.includes('2X') || fullText.includes('2 X') || fullText.includes('(2X') ? 2 : 1;
    let capacity_gb_per_module = 16;
    if (fullText.includes('8GB') && modules === 1) capacity_gb_per_module = 8;
    else if (fullText.includes('16GB (2X8GB)') || fullText.includes('16GB (2 X 8GB)')) { modules = 2; capacity_gb_per_module = 8; }
    else if (fullText.includes('32GB (2X16GB)') || fullText.includes('32GB (2 X 16GB)')) { modules = 2; capacity_gb_per_module = 16; }
    else if (fullText.includes('64GB (2X32GB)') || fullText.includes('64GB (2 X 32GB)')) { modules = 2; capacity_gb_per_module = 32; }
    else if (fullText.includes('96GB')) { modules = 2; capacity_gb_per_module = 48; }

    return { type, speed_mhz, modules, capacity_gb_per_module };
  }

  if (category === 'gpu') {
    let length_mm = 260;
    let tdp_w = 160;
    let power_connectors = '8-pin';
    let recommended_psu_w = 550;
    let slot_width = 2;

    if (fullText.includes('4090') || fullText.includes('5090')) {
      length_mm = 350; tdp_w = 450; power_connectors = '16-pin (12VHPWR)'; recommended_psu_w = 1000; slot_width = 3.5;
    } else if (fullText.includes('4080') || fullText.includes('5080') || fullText.includes('7900 XTX')) {
      length_mm = 320; tdp_w = 320; power_connectors = '16-pin (12VHPWR)'; recommended_psu_w = 750; slot_width = 3;
    } else if (fullText.includes('4070') || fullText.includes('5070') || fullText.includes('7800 XT') || fullText.includes('7700 XT')) {
      length_mm = 280; tdp_w = 220; power_connectors = '16-pin (12VHPWR)'; recommended_psu_w = 650; slot_width = 2.5;
    } else if (fullText.includes('4060') || fullText.includes('5060') || fullText.includes('7600') || fullText.includes('3060')) {
      length_mm = 240; tdp_w = 130; power_connectors = '8-pin'; recommended_psu_w = 550; slot_width = 2;
    } else if (fullText.includes('3050') || fullText.includes('1650') || fullText.includes('1660') || fullText.includes('5050')) {
      length_mm = 200; tdp_w = 75; power_connectors = 'none'; recommended_psu_w = 450; slot_width = 2;
    }

    return { length_mm, tdp_w, power_connectors, recommended_psu_w, slot_width };
  }

  if (category === 'psu') {
    let wattage_w = 650;
    let form_factor = fullText.includes('SFX') ? 'SFX' : 'ATX';
    let efficiency = '80+ Bronze';

    const matchW = fullText.match(/(\d{3,4})\s*W/);
    if (matchW) wattage_w = parseInt(matchW[1], 10);

    if (fullText.includes('TITANIUM')) efficiency = '80+ Titanium';
    else if (fullText.includes('PLATINUM')) efficiency = '80+ Platinum';
    else if (fullText.includes('GOLD')) efficiency = '80+ Gold';
    else if (fullText.includes('BRONZE')) efficiency = '80+ Bronze';
    else if (fullText.includes('WHITE')) efficiency = '80+ White';

    return { wattage_w, form_factor, efficiency };
  }

  if (category === 'case') {
    let supported_form_factors = ['ATX', 'mATX', 'ITX'];
    let max_gpu_length_mm = 360;
    let max_cooler_height_mm = 165;
    let supported_psu_form_factors = ['ATX'];
    let supported_radiator_sizes_mm = [240, 280, 360];

    if (fullText.includes('MINI') || fullText.includes('ITX') || fullText.includes('COMPACT') || fullText.includes('NANO')) {
      supported_form_factors = ['mATX', 'ITX'];
      max_gpu_length_mm = 320;
      max_cooler_height_mm = 155;
      supported_psu_form_factors = ['ATX', 'SFX'];
      supported_radiator_sizes_mm = [240];
    }

    return { supported_form_factors, max_gpu_length_mm, max_cooler_height_mm, supported_psu_form_factors, supported_radiator_sizes_mm };
  }

  if (category === 'cooler') {
    const isAio = fullText.includes('AIO') || fullText.includes('LIQUID') || fullText.includes('WATER') || fullText.includes('240') || fullText.includes('280') || fullText.includes('360') || fullText.includes('420') || fullText.includes('KRAKEN') || fullText.includes('HYDRO') || fullText.includes('MAG CORELIQUID');
    if (isAio) {
      let radiator_size_mm = 360;
      if (fullText.includes('240')) radiator_size_mm = 240;
      else if (fullText.includes('280')) radiator_size_mm = 280;
      else if (fullText.includes('420')) radiator_size_mm = 420;
      return {
        type: 'aio',
        radiator_size_mm,
        socket_support: ['LGA1700', 'LGA1851', 'AM5', 'AM4'],
        tdp_rating_w: radiator_size_mm >= 360 ? 300 : 250
      };
    } else {
      return {
        type: 'air',
        height_mm: 155,
        socket_support: ['LGA1700', 'LGA1851', 'AM5', 'AM4'],
        tdp_rating_w: 220
      };
    }
  }

  if (category === 'storage') {
    const isHdd = fullText.includes('HDD') || fullText.includes('BARRACUDA') || fullText.includes('IRONWOLF') || fullText.includes('PURPLE') || fullText.includes('RED') || fullText.includes('3.5');
    if (isHdd) {
      let capacity_gb = 1000;
      if (fullText.includes('2TB')) capacity_gb = 2000;
      else if (fullText.includes('4TB')) capacity_gb = 4000;
      else if (fullText.includes('6TB')) capacity_gb = 6000;
      else if (fullText.includes('8TB')) capacity_gb = 8000;
      return { interface: 'SATA', form_factor: '3.5-inch', capacity_gb };
    }

    const isSata = fullText.includes('SATA') || fullText.includes('2.5');
    let capacity_gb = 500;
    if (fullText.includes('250GB') || fullText.includes('256GB')) capacity_gb = 256;
    else if (fullText.includes('500GB') || fullText.includes('512GB')) capacity_gb = 500;
    else if (fullText.includes('1TB')) capacity_gb = 1000;
    else if (fullText.includes('2TB')) capacity_gb = 2000;
    else if (fullText.includes('4TB')) capacity_gb = 4000;

    return {
      interface: isSata ? 'SATA' : 'NVMe',
      form_factor: isSata ? '2.5-inch' : 'M.2-2280',
      capacity_gb
    };
  }

  return {};
}

function parseCardsFromHtml(html, category) {
  const items = [];
  const parts = html.split(/<a[^>]*class="[^"]*product-card[^"]*"[^>]*href="([^"]+)"/gi);

  for (let i = 1; i < parts.length; i += 2) {
    const href = parts[i];
    const cardBody = parts[i + 1] || '';

    // Extract image with flexible regex
    let imageUrl = null;
    let title = null;

    const imgTagMatch = cardBody.match(/<img[^>]+>/i);
    if (imgTagMatch) {
      const tag = imgTagMatch[0];
      const srcM = tag.match(/src="([^"]+)"/i);
      const altM = tag.match(/alt="([^"]*)"/i);
      if (srcM) imageUrl = srcM[1];
      if (altM && altM[1].trim()) title = altM[1].trim();
    }

    // If title not in img alt, check product-card-content title
    if (!title || title.trim() === '') {
      const titleMatch = cardBody.match(/<p class="[^"]*text-\[var\(--color-text-figma-primary\)][^"]*">([^<]+)<\/p>/i);
      if (titleMatch) title = titleMatch[1];
    }

    if (!title) {
      const slug = href.replace('/products/', '');
      title = slug.replace(/-/g, ' ');
    }

    // Filter out laptop RAM or unwanted services
    if (category === 'ram' && (title.toUpperCase().includes('SODIMM') || title.toUpperCase().includes('LAPTOP'))) {
      continue;
    }
    if (category === 'cooler' && (title.toUpperCase().includes('FAN CASE') || title.toUpperCase().includes('QUẠT CASE') || title.toUpperCase().includes('FAN PACK'))) {
      continue;
    }

    // Extract price
    let price = 0;
    const salePriceMatch = cardBody.match(/<span[^>]*text-\[var\(--color-flash-price-sale\)\][^>]*>([0-9\.]+)\s*đ<\/span>/i);
    if (salePriceMatch) {
      price = cleanPrice(salePriceMatch[1]);
    } else {
      const anyPriceMatch = cardBody.match(/([0-9]{1,3}(?:\.[0-9]{3})+)\s*đ/i);
      if (anyPriceMatch) {
        price = cleanPrice(anyPriceMatch[1]);
      }
    }

    if (!price || price <= 0) continue;

    // Extract chips / specs
    const chipMatches = [...cardBody.matchAll(/<span class="min-w-0 truncate">([^<]+)<\/span>/gi)].map(m => m[1]);

    const brand = inferBrand(title);
    const specs = inferSpecs(category, title, chipMatches);

    // Format cleaner image URL
    if (imageUrl && !imageUrl.startsWith('http')) {
      imageUrl = `https:${imageUrl}`;
    }

    items.push({
      category,
      brand,
      name: title.trim(),
      price_min: price,
      price_max: price,
      specs,
      image_url: imageUrl
    });
  }

  return items;
}

async function fetchPage(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) return '';
    return await res.text();
  } catch (e) {
    console.error(`Fetch error for ${url}:`, e.message);
    return '';
  }
}

async function run() {
  console.log('=== BẮT ĐẦU CÀO DỮ LIỆU TỪ GEARVN (CÓ HÌNH ẢNH & SPECS) ===\n');
  const allItems = [];
  const seenNames = new Set();
  const today = '2026-09-15';

  for (const col of COLLECTIONS) {
    console.log(`Đang cào danh mục: ${col.category.toUpperCase()} (${col.handle})...`);
    let catCount = 0;

    for (let page = 1; page <= col.maxPages; page++) {
      const pageUrl = `https://gearvn.com/collections/${col.handle}?page=${page}`;
      const html = await fetchPage(pageUrl);
      if (!html || html.length < 1000) break;

      const items = parseCardsFromHtml(html, col.category);
      if (items.length === 0) break;

      for (const item of items) {
        if (!seenNames.has(item.name)) {
          seenNames.add(item.name);
          allItems.push(item);
          catCount++;
        }
      }
      console.log(`  - Trang ${page}: cào được ${items.length} mục (Tổng hợp lệ danh mục: ${catCount})`);
    }
  }

  console.log(`\n=> TỔNG CỘNG ĐÃ CÀO ĐƯỢC: ${allItems.length} linh kiện thực tế kèm ảnh!`);

  if (allItems.length > 0) {
    let sql = `-- ============================================================\n`;
    sql += `-- DỮ LIỆU LINH KIỆN MỞ RỘNG TOÀN DIỆN TỪ GEARVN\n`;
    sql += `-- Bao gồm: Tên chính xác, Giá thực tế, Ảnh CDN hstatic chính hãng, Specs chuẩn\n`;
    sql += `-- Ngày cập nhật: ${today}\n`;
    sql += `-- ============================================================\n\n`;
    sql += `INSERT INTO pc_components (category, brand, name, price_min, price_max, price_updated_at, specs, image_url) VALUES\n`;

    const rowsSql = allItems.map(r => {
      const img = r.image_url ? `'${escapeSql(r.image_url)}'` : 'NULL';
      return `('${r.category}', '${escapeSql(r.brand)}', '${escapeSql(r.name)}', ${r.price_min}, ${r.price_max}, '${today}', '${escapeSql(JSON.stringify(r.specs))}'::jsonb, ${img})`;
    }).join(',\n');

    sql += rowsSql + ';\n';

    const outPath = path.resolve('seed_gearvn_full.sql');
    fs.writeFileSync(outPath, sql, 'utf-8');
    console.log(`\nĐã ghi thành công ${allItems.length} linh kiện vào file: ${outPath}`);
  }
}

run().catch(console.error);
