#!/usr/bin/env node
/* ============================================================
   Build catalog: copies ~/Downloads/aclothes photos into
   ./images/aclothes (URL-safe slugs) and writes js/products.js
   Run: node scripts/build-catalog.js
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');

const SRC = path.join(process.env.HOME, 'Downloads', 'aclothes');
const ROOT = path.resolve(__dirname, '..');
const DEST = path.join(ROOT, 'images', 'aclothes');

/* ---------------- catalog (src hints -> product) ---------------- */
// src: array of substrings uniquely identifying the source file
// slug: output filename (kept short, URL-safe)
const CATALOG = [
  { s: ['Mary Janes'], slug: 'maryjanes-burgundy', n: 'Burgundy Patent Slingback Mary Janes', b: 'Charmpad Studio', c: 'shoes', sc: 'Heels', p: 74, op: 99, r: 4.7, rv: 64, sz: ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'], co: ['Burgundy', 'Black'], t: ['vintage', 'patent', 'kitten-heel'], po: 78, isNew: true },
  { s: ['AliBoxGifts'], slug: 'alibox-gift-bundle', n: 'AliBox Handmade Gift Bundle', b: 'Swadeshi Wares', c: 'home', sc: 'Objects', p: 36, op: null, r: 4.6, rv: 41, sz: ['One Size'], co: [], t: ['gift', 'handmade', 'set'], po: 44, isNew: false },
  { s: ['Girasoles'], slug: 'vangogh-sunflower-earrings', n: 'Van Gogh Sunflower Earrings', b: 'Atelier Moti', c: 'jewellery', sc: 'Earrings', p: 42, op: 56, r: 4.8, rv: 87, sz: ['One Size'], co: ['Multicolour'], t: ['hand-painted', 'art', 'statement'], po: 81, isNew: true },
  { s: ['Bleach tank top'], slug: 'bleach-tank-top', n: 'Bleach Design Tank Top', b: 'Artisanal Threads', c: 'clothing', sc: 'Tops', p: 24, op: 34, r: 4.4, rv: 52, sz: ['S', 'M', 'L'], co: ['White'], t: ['bleach', 'summer', 'streetwear'], po: 66, isNew: false },
  { s: ['Comfort Colors Tops'], slug: 'comfort-cream-crop-tee', n: 'Block-Printed Cream Crop Tee', b: 'Rangoli Studio', c: 'clothing', sc: 'Tops', p: 32, op: null, r: 4.6, rv: 128, sz: ['S', 'M', 'L', 'XL'], co: ['Cream', 'Blue'], t: ['block-print', 'cotton', 'crop'], po: 74, isNew: true },
  { s: ['Earthy Kolhapuris'], slug: 'kolhapuri-sandals', n: 'Earthy Kolhapuri Sandals', b: 'Kolhapur Collective', c: 'shoes', sc: 'Sandals', p: 38, op: 52, r: 4.9, rv: 302, sz: ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9'], co: ['Tan', 'Maroon'], t: ['handmade', 'leather', 'traditional'], po: 93, isNew: true },
  { s: ['Green paper quilling jhumka'], slug: 'green-quilling-jhumka', n: 'Green Quilled Jhumka Earrings', b: 'Kala Kendra', c: 'jewellery', sc: 'Earrings', p: 18, op: null, r: 4.7, rv: 118, sz: ['One Size'], co: ['Green'], t: ['quilling', 'jhumka', 'paper-art'], po: 88, isNew: false },
  { s: ['guitar design'], slug: 'guitar-bleach-tank', n: 'Hand-Bleached Guitar Tank', b: 'Artisanal Threads', c: 'clothing', sc: 'Tops', p: 26, op: null, r: 4.3, rv: 37, sz: ['S', 'M', 'L'], co: ['Black'], t: ['bleach', 'streetwear', 'graphic'], po: 52, isNew: false },
  { s: ['Dragonfly Arm Cuff'], slug: 'dragonfly-arm-cuff', n: 'Handmade Dragonfly Arm Cuff', b: 'Kala Kendra', c: 'jewellery', sc: 'Cuffs', p: 29, op: null, r: 4.7, rv: 93, sz: ['One Size'], co: ['Antique Gold'], t: ['wire-wrap', 'handmade', 'boho'], po: 70, isNew: true },
  { s: ['How to Paint on Jeans'], slug: 'handpainted-wide-jeans', n: 'Hand-Painted Wide Denim Jeans', b: 'Rangoli Studio', c: 'clothing', sc: 'Jeans', p: 58, op: 76, r: 4.5, rv: 49, sz: ['XS', 'S', 'M', 'L', 'XL'], co: ['Indigo'], t: ['hand-painted', 'denim', 'one-of-one'], po: 68, isNew: true },
  { s: ['Moon and Sun'], slug: 'moon-sun-jeans', n: 'Moon & Sun Painted Jeans', b: 'Rangoli Studio', c: 'clothing', sc: 'Jeans', p: 62, op: 84, r: 4.8, rv: 143, sz: ['S', 'M', 'L', 'XL'], co: ['Washed Blue'], t: ['painted', 'celestial', 'denim'], po: 91, isNew: false },
  { s: ['Quilled Cherry'], slug: 'cherry-earrings', n: 'Quilled Cherry Earrings', b: 'Kala Kendra', c: 'jewellery', sc: 'Earrings', p: 15, op: null, r: 4.6, rv: 77, sz: ['One Size'], co: ['Red'], t: ['quilling', 'fruit', 'playful'], po: 59, isNew: false },
  { s: ['Spiral Swirl Pendant'], slug: 'spiral-pendant-necklace', n: 'Spiral Swirl Pendant Necklace', b: 'Estrella', c: 'jewellery', sc: 'Necklaces', p: 34, op: 45, r: 4.6, rv: 88, sz: ['One Size'], co: ['Silver'], t: ['minimal', 'silver', 'unisex'], po: 75, isNew: true },
  { s: ['Bohemian culture'], slug: 'bohemian-linen-dress', n: 'Bohemian Pure Linen Shirt', b: 'Boho Threads', c: 'clothing', sc: 'Shirts', p: 58, op: 78, r: 4.8, rv: 176, sz: ['XS', 'S', 'M', 'L', 'XL'], co: ['Beige', 'Green'], t: ['linen', 'shirt', 'handmade'], po: 89, isNew: true },
  { s: ['item is unavailable'], slug: 'collectors-ceramic-vessel', n: "Collector's Ceramic Vessel", b: 'Terracotta Tales', c: 'home', sc: 'Objects', p: 44, op: null, r: 4.5, rv: 61, sz: ['One Size'], co: ['Terracotta'], t: ['ceramic', 'handmade', 'decor'], po: 47, isNew: false },
  { s: ['Tiger eye shirt'], slug: 'tiger-eye-shirt', n: 'Tiger Eye Statement Shirt', b: 'Sirohi', c: 'clothing', sc: 'Shirts', p: 45, op: 58, r: 4.6, rv: 94, sz: ['S', 'M', 'L'], co: ['Multicolour'], t: ['printed', 'oversized', 'statement'], po: 79, isNew: true },
  { s: ['Tiger.jpeg'], slug: 'tiger-graphic-tee', n: 'Tiger Graphic Tee', b: 'Sirohi', c: 'clothing', sc: 'Tees', p: 28, op: null, r: 4.4, rv: 58, sz: ['S', 'M', 'L', 'XL'], co: ['Black'], t: ['graphic', 'streetwear'], po: 63, isNew: false },
  { s: ['Trendy Bleach'], slug: 'bleach-streetwear-tee', n: 'Trendy Bleach Sweatshirt', b: 'Artisanal Threads', c: 'clothing', sc: 'Tees', p: 38, op: null, r: 4.3, rv: 41, sz: ['S', 'M', 'L', 'XL'], co: ['Black'], t: ['bleach', 'streetwear', 'oversized'], po: 51, isNew: false },
  { s: ['(1) copy'], slug: 'embroidered-slip-dress', n: 'Wire Earrings', b: 'Estrella', c: 'jewellery', sc: 'Earrings', p: 20, op: 28, r: 4.6, rv: 66, sz: ['One Size'], co: ['Silver', 'Gold'], t: ['wire', 'earrings', 'minimal'], po: 72, isNew: false },
  { s: ['(1).jpeg'], slug: 'chanderi-co-ord', n: 'Spiderman Sneakers', b: 'Charmpad Studio', c: 'shoes', sc: 'Sneakers', p: 45, op: 58, r: 4.6, rv: 121, sz: ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'], co: ['Black', 'Red'], t: ['sneakers', 'graphic', 'streetwear'], po: 84, isNew: true },
  { s: ['(14).jpeg'], slug: 'handloom-silk-saree', n: 'Clay Earrings', b: 'Atelier Moti', c: 'jewellery', sc: 'Earrings', p: 24, op: 34, r: 4.7, rv: 98, sz: ['One Size'], co: ['Terracotta', 'Cream'], t: ['clay', 'earrings', 'handmade'], po: 87, isNew: false },
  { s: ['(15).jpeg'], slug: 'ankle-strap-flats', n: 'Embroidered Ankle-Strap Flats', b: 'Charmpad Studio', c: 'shoes', sc: 'Flats', p: 46, op: null, r: 4.5, rv: 54, sz: ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'], co: ['Navy', 'Red'], t: ['embroidered', 'flat', 'festive'], po: 60, isNew: true },
  { s: ['(2) copy'], slug: 'indigo-block-print-dress', n: 'Indigo Block-Print Dress', b: 'Rangoli Studio', c: 'clothing', sc: 'Dresses', p: 52, op: 70, r: 4.6, rv: 88, sz: ['S', 'M', 'L', 'XL'], co: ['Indigo'], t: ['block-print', 'cotton', 'midi'], po: 76, isNew: false },
  { s: ['(2).jpeg'], slug: 'satin-slip-dress', n: 'Bias-Cut Satin Slip Dress', b: 'Estrella', c: 'clothing', sc: 'Dresses', p: 64, op: null, r: 4.6, rv: 73, sz: ['XS', 'S', 'M', 'L'], co: ['Champagne'], t: ['slip', 'satin', 'minimal'], po: 71, isNew: true },
  { s: ['(3).jpeg'], slug: 'co-ord-lounge-set', n: 'Cotton Lounge Co-ord Set', b: 'IndiMade', c: 'clothing', sc: 'Sets', p: 48, op: null, r: 4.5, rv: 82, sz: ['S', 'M', 'L', 'XL'], co: ['Grey', 'Olive'], t: ['loungewear', 'cotton', 'set'], po: 55, isNew: false },
  { s: ['(4).jpeg'], slug: 'printed-midi-skirt', n: 'Block-Printed Midi Skirt', b: 'Rangoli Studio', c: 'clothing', sc: 'Skirts', p: 40, op: 54, r: 4.5, rv: 47, sz: ['XS', 'S', 'M', 'L', 'XL'], co: ['Multicolour'], t: ['printed', 'cotton', 'swing'], po: 67, isNew: false },
  { s: ['(5).jpeg'], slug: 'chunky-bead-bracelet', n: 'Chunky Bead Stack Bracelet', b: 'Kala Kendra', c: 'jewellery', sc: 'Bracelets', p: 16, op: null, r: 4.4, rv: 39, sz: ['One Size'], co: ['Multicolour'], t: ['beaded', 'stacking', 'colourful'], po: 49, isNew: false },
  { s: ['(6).jpeg'], slug: 'knotted-silk-band', n: 'Knotted Silk Hair Band', b: 'Swadeshi Wares', c: 'accessories', sc: 'Hair', p: 12, op: null, r: 4.5, rv: 72, sz: ['One Size'], co: ['Blush', 'Sage'], t: ['silk', 'hair-accessory'], po: 57, isNew: true },
  { s: ['copy.jpeg'], slug: 'batik-crop-top', n: 'Batik Printed Crop Top', b: 'Sirohi', c: 'clothing', sc: 'Tops', p: 24, op: null, r: 4.3, rv: 33, sz: ['S', 'M'], co: ['Multicolour'], t: ['batik', 'crop', 'boho'], po: 46, isNew: false },
  { s: ['_.jpeg'], slug: 'matte-hoop-earrings', n: 'Matte Black Hoop Earrings', b: 'Estrella', c: 'jewellery', sc: 'Earrings', p: 19, op: null, r: 4.6, rv: 91, sz: ['One Size'], co: ['Black'], t: ['hoops', 'matte', 'minimal'], po: 62, isNew: false },
  { s: ['beaded flower earrings'], slug: 'beaded-flower-earrings', n: 'Beaded Flower Earrings', b: 'Kala Kendra', c: 'jewellery', sc: 'Earrings', p: 22, op: null, r: 4.7, rv: 104, sz: ['One Size'], co: ['Multicolour'], t: ['floral', 'beaded', 'handmade'], po: 85, isNew: true },
  { s: ['castom spiderman'], slug: 'spiderman-custom-tee', n: 'Custom Spider Tee', b: 'Artisanal Threads', c: 'clothing', sc: 'Tees', p: 27, op: null, r: 4.2, rv: 44, sz: ['S', 'M', 'L', 'XL'], co: ['Navy'], t: ['custom', 'streetwear', 'graphic'], po: 48, isNew: false },
  { s: ['diy painted jorts'], slug: 'diy-painted-jorts', n: 'DIY Painted Denim Jorts', b: 'Rangoli Studio', c: 'clothing', sc: 'Jeans', p: 34, op: null, r: 4.5, rv: 58, sz: ['S', 'M', 'L'], co: ['Indigo'], t: ['painted', 'jorts', 'summer'], po: 58, isNew: true },

  /* ---- untitled folder ---- */
  { s: ['untitled', 'BAFTA'], slug: 'bafta-embroidered-top', n: 'Bafta Embroidered Peplum', b: 'IndiMade', c: 'clothing', sc: 'Tops', p: 39, op: null, r: 4.4, rv: 37, sz: ['S', 'M', 'L'], co: ['Black'], t: ['embroidered', 'peplum', 'festive'], po: 50, isNew: false },
  { s: ['untitled', 'BLUE SATIN'], slug: 'blue-satin-drape-tank', n: 'Blue Satin Drape Tank', b: 'Estrella', c: 'clothing', sc: 'Tops', p: 33, op: 44, r: 4.6, rv: 69, sz: ['S', 'M', 'L'], co: ['Cobalt'], t: ['satin', 'drape', 'going-out'], po: 73, isNew: true },
  { s: ['untitled', 'Sneekers'], slug: 'classic-canvas-sneakers', n: 'Classic Canvas Sneakers', b: 'Charmpad Studio', c: 'shoes', sc: 'Sneakers', p: 42, op: 56, r: 4.5, rv: 132, sz: ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10'], co: ['White', 'Black'], t: ['sneakers', 'canvas', 'everyday'], po: 81, isNew: true },
  { s: ['untitled', 'THE BEIGE FIT'], slug: 'beige-highwaist-trousers', n: 'The Beige Fit High-Waist Trousers', b: 'Sirohi', c: 'clothing', sc: 'Trousers', p: 46, op: null, r: 4.6, rv: 96, sz: ['XS', 'S', 'M', 'L', 'XL'], co: ['Beige'], t: ['wide-leg', 'high-waist', 'work'], po: 77, isNew: true },
  { s: ['untitled', 'Halter Corset Maxi'], slug: 'striped-corset-maxi', n: 'Striped Halter Corset Maxi Dress', b: 'Boho Threads', c: 'clothing', sc: 'Dresses', p: 79, op: 104, r: 4.8, rv: 157, sz: ['XS', 'S', 'M', 'L'], co: ['White', 'Black'], t: ['halter', 'corset', 'maxi'], po: 90, isNew: true },
  { s: ['untitled', '(14).jpeg'], slug: 'embroidered-cushion-cover', n: 'Hand-Embroidered Cushion Cover', b: 'Terracotta Tales', c: 'home', sc: 'Textiles', p: 26, op: null, r: 4.4, rv: 45, sz: ['One Size'], co: ['Sage'], t: ['embroidered', 'cushion', 'handmade'], po: 53, isNew: false },
  { s: ['untitled', '(15).jpeg'], slug: 'canvas-weekender-tote', n: 'Canvas Weekender Tote', b: 'Swadeshi Wares', c: 'bags', sc: 'Totes', p: 32, op: null, r: 4.5, rv: 61, sz: ['One Size'], co: ['Natural', 'Olive'], t: ['canvas', 'tote', 'travel'], po: 56, isNew: true },
  { s: ['untitled', '(16).jpeg'], slug: 'golden-jhumka-earrings', n: 'Classic Golden Jhumka Earrings', b: 'Atelier Moti', c: 'jewellery', sc: 'Earrings', p: 28, op: null, r: 4.7, rv: 88, sz: ['One Size'], co: ['Gold'], t: ['jhumka', 'bridal', 'gold'], po: 65, isNew: false },
  { s: ['untitled', '(17).jpeg'], slug: 'printed-chiffon-scarf', n: 'Printed Chiffon Scarf', b: 'Sirohi', c: 'accessories', sc: 'Scarves', p: 18, op: null, r: 4.3, rv: 51, sz: ['One Size'], co: ['Multicolour'], t: ['chiffon', 'scarf', 'summer'], po: 43, isNew: false },
  { s: ['untitled', '(18).jpeg'], slug: 'macrame-wall-hanging', n: 'Macramé Wall Hanging', b: 'Terracotta Tales', c: 'home', sc: 'Decor', p: 36, op: null, r: 4.6, rv: 34, sz: ['One Size'], co: ['Natural'], t: ['macrame', 'boho', 'wall-decor'], po: 40, isNew: false },
  { s: ['untitled', '(19).jpeg'], slug: 'terracotta-planter-pot', n: 'Hand-Thrown Terracotta Planter', b: 'Terracotta Tales', c: 'home', sc: 'Objects', p: 21, op: null, r: 4.5, rv: 57, sz: ['One Size'], co: ['Terracotta'], t: ['planter', 'terracotta', 'handmade'], po: 45, isNew: false },
  { s: ['untitled', '(20).jpeg'], slug: 'paisley-cotton-duffel', n: 'Paisley Cotton Duffle Bag', b: 'Swadeshi Wares', c: 'bags', sc: 'Duffels', p: 54, op: 68, r: 4.6, rv: 48, sz: ['One Size'], co: ['Maroon'], t: ['duffle', 'paisley', 'weekender'], po: 61, isNew: true },
  { s: ['untitled', '(21).jpeg'], slug: 'brass-leaf-brooch', n: 'Brass Leaf Brooch', b: 'Atelier Moti', c: 'jewellery', sc: 'Brooches', p: 17, op: null, r: 4.5, rv: 42, sz: ['One Size'], co: ['Brass'], t: ['brooch', 'leaf', 'vintage'], po: 38, isNew: false },
  { s: ['untitled', '(22).jpeg'], slug: 'handloom-table-runner', n: 'Handloom Cotton Table Runner', b: 'Terracotta Tales', c: 'home', sc: 'Textiles', p: 31, op: null, r: 4.4, rv: 26, sz: ['One Size'], co: ['Sage', 'Cream'], t: ['table', 'handloom', 'striped'], po: 36, isNew: false },
  { s: ['untitled', '(23).jpeg'], slug: 'waxed-canvas-backpack', n: 'Waxed Canvas Backpack', b: 'Swadeshi Wares', c: 'bags', sc: 'Backpacks', p: 58, op: null, r: 4.7, rv: 74, sz: ['One Size'], co: ['Olive', 'Black'], t: ['backpack', 'waxed', 'campus'], po: 69, isNew: true },
  { s: ['untitled', '(24).jpeg'], slug: 'ceramic-coaster-set', n: 'Printed Ceramic Coaster Set', b: 'Terracotta Tales', c: 'home', sc: 'Tableware', p: 14, op: null, r: 4.3, rv: 33, sz: ['One Size'], co: ['Multicolour'], t: ['coasters', 'ceramic', 'set'], po: 32, isNew: false },

{ s: ['Backpack.jpeg'], slug: 'canvas-travel-backpack', n: 'Canvas Travel Backpack', b: 'Swadeshi Wares', c: 'bags', sc: 'Backpacks', p: 44, op: 58, r: 4.6, rv: 58, sz: ['One Size'], co: ['Olive', 'Tan'], t: ['backpack', 'canvas', 'travel'], po: 62, isNew: true },
{ s: ['Bags.jpeg'], slug: 'everyday-leather-tote', n: 'Everyday Leather Tote', b: 'Mirabeau', c: 'bags', sc: 'Totes', p: 68, op: 88, r: 4.7, rv: 121, sz: ['One Size'], co: ['Tan', 'Black'], t: ['tote', 'leather', 'everyday'], po: 74, isNew: true },
{ s: ['Blush wand'], slug: 'cream-blush-wand', n: 'Cream Blush Wand', b: 'Veridana', c: 'beauty', sc: 'Makeup', p: 26, op: null, r: 4.5, rv: 96, sz: ['One Size'], co: [], t: ['blush', 'makeup', 'clean-beauty'], po: 70, isNew: true },
{ s: ['Glossy Burgundy Buckle'], slug: 'burgundy-buckle-shoulder-bag', n: 'Burgundy Buckle Shoulder Bag', b: 'Mirabeau', c: 'bags', sc: 'Shoulder', p: 74, op: 96, r: 4.7, rv: 87, sz: ['One Size'], co: ['Burgundy'], t: ['shoulder-bag', 'buckle', 'evening'], po: 78, isNew: true },
{ s: ['Candle Warmer Lamp'], slug: 'candle-warmer-lamp', n: 'Candle Warmer Lamp', b: 'Terracotta Tales', c: 'home', sc: 'Objects', p: 52, op: 66, r: 4.8, rv: 44, sz: ['One Size'], co: ['Gold', 'Black'], t: ['lamp', 'candle', 'ambient'], po: 63, isNew: false },
{ s: ['Pool Ball Tealight'], slug: 'tealight-candle-holder-set', n: 'Pool Ball Tealight Holder Set', b: 'Terracotta Tales', c: 'home', sc: 'Objects', p: 34, op: null, r: 4.5, rv: 39, sz: ['One Size'], co: ['Multicolour'], t: ['tealight', 'candle-holder', 'set'], po: 51, isNew: false },
{ s: ['Prada'], slug: 'designer-leather-shoulder-bag', n: 'Designer Leather Shoulder Bag', b: 'Mirabeau', c: 'bags', sc: 'Shoulder', p: 128, op: 158, r: 4.8, rv: 132, sz: ['One Size'], co: ['Black'], t: ['designer', 'leather', 'shoulder'], po: 82, isNew: true },
{ s: ['Sephora PRO'], slug: 'new-nudes-palette', n: 'Pro New Nudes Eye Palette', b: 'Veridana', c: 'beauty', sc: 'Makeup', p: 44, op: 56, r: 4.7, rv: 208, sz: ['One Size'], co: [], t: ['eyeshadow', 'palette', 'pro'], po: 76, isNew: true },
{ s: ['Wedding Day'], slug: 'wedding-eye-palette', n: 'Wedding-Day Eye Palette', b: 'Veridana', c: 'beauty', sc: 'Makeup', p: 38, op: 49, r: 4.6, rv: 142, sz: ['One Size'], co: [], t: ['eyeshadow', 'wedding', 'pastel'], po: 64, isNew: false },
{ s: ['(14) copy'], slug: 'handloom-midi-skirt', n: 'Handloom Cotton Midi Skirt', b: 'Sirohi', c: 'clothing', sc: 'Skirts', p: 32, op: 42, r: 4.5, rv: 52, sz: ['XS', 'S', 'M', 'L', 'XL'], co: ['Cream', 'Sage'], t: ['handloom', 'skirt', 'cotton'], po: 58, isNew: false },
{ s: ['(17).jpeg'], slug: 'bloom-print-kurta', n: 'Bloom Print Cotton Kurta', b: 'Boho Threads', c: 'clothing', sc: 'Kurtas', p: 42, op: 54, r: 4.6, rv: 74, sz: ['S', 'M', 'L', 'XL', 'XXL'], co: ['Multicolour'], t: ['kurta', 'cotton', 'festive'], po: 66, isNew: true },
{ s: ['(18).jpeg'], slug: 'printed-fleece-hoodie', n: 'Printed Fleece Hoodie', b: 'Artisanal Threads', c: 'clothing', sc: 'Hoodies', p: 39, op: 49, r: 4.4, rv: 46, sz: ['S', 'M', 'L', 'XL'], co: ['Grey'], t: ['hoodie', 'fleece', 'graphic'], po: 47, isNew: false },
{ s: ['(19).jpeg'], slug: 'bandhani-co-ord', n: 'Bandhani Print Co-ord', b: 'Rangoli Studio', c: 'clothing', sc: 'Sets', p: 58, op: 76, r: 4.7, rv: 83, sz: ['S', 'M', 'L', 'XL'], co: ['Red', 'Yellow'], t: ['co-ord', 'bandhani', 'silk-touch'], po: 72, isNew: true },
{ s: ['(20).jpeg'], slug: 'leather-crossbody-mini', n: 'Mini Leather Crossbody', b: 'Mirabeau', c: 'bags', sc: 'Crossbody', p: 52, op: 66, r: 4.6, rv: 61, sz: ['One Size'], co: ['Black', 'Tan'], t: ['crossbody', 'mini', 'leather'], po: 60, isNew: false },
{ s: ['(21).jpeg'], slug: 'oxidised-jhumka-set', n: 'Oxidised Brass Jhumka Set', b: 'Atelier Moti', c: 'jewellery', sc: 'Earrings', p: 29, op: 38, r: 4.7, rv: 92, sz: ['One Size'], co: ['Antique'], t: ['oxidised', 'jhumka', 'brass'], po: 68, isNew: true },
{ s: ['(22).jpeg'], slug: 'block-print-cushion-duo', n: 'Block-Print Cushion Duo', b: 'Terracotta Tales', c: 'home', sc: 'Textiles', p: 46, op: 58, r: 4.6, rv: 37, sz: ['One Size'], co: ['Sage', 'Terracotta'], t: ['cushion', 'block-print', 'set'], po: 42, isNew: false },
{ s: ['(23).jpeg'], slug: 'chiffon-dupatta', n: 'Chiffon Print Dupatta', b: 'Sirohi', c: 'accessories', sc: 'Scarves', p: 24, op: null, r: 4.4, rv: 43, sz: ['One Size'], co: ['Multicolour'], t: ['dupatta', 'chiffon', 'printed'], po: 45, isNew: false },
{ s: ['(24).jpeg'], slug: 'embroidered-festive-flats', n: 'Embroidered Festive Flats', b: 'Charmpad Studio', c: 'shoes', sc: 'Flats', p: 47, op: 60, r: 4.6, rv: 57, sz: ['UK 3', 'UK 4', 'UK 5', 'UK 6', 'UK 7', 'UK 8'], co: ['Red', 'Gold'], t: ['embroidered', 'flats', 'festive'], po: 61, isNew: true },
{ s: ['(25).jpeg'], slug: 'satin-quilted-pouch', n: 'Satin Quilted Pouch', b: 'Swadeshi Wares', c: 'accessories', sc: 'Pouches', p: 28, op: null, r: 4.5, rv: 48, sz: ['One Size'], co: ['Blush', 'Black'], t: ['pouch', 'satin', 'quilted'], po: 43, isNew: false },
{ s: ['(26).jpeg'], slug: 'handpainted-boho-blouse', n: 'Hand-Painted Boho Blouse', b: 'Rangoli Studio', c: 'clothing', sc: 'Blouses', p: 36, op: 46, r: 4.6, rv: 63, sz: ['S', 'M', 'L', 'XL'], co: ['Cream'], t: ['hand-painted', 'blouse', 'boho'], po: 57, isNew: true },
{ s: ['(27).jpeg'], slug: 'mango-wood-decor', n: 'Mango Wood Decor Set', b: 'Terracotta Tales', c: 'home', sc: 'Decor', p: 31, op: 40, r: 4.4, rv: 35, sz: ['One Size'], co: ['Natural'], t: ['mango-wood', 'decor', 'carved'], po: 39, isNew: false },
{ s: ['(28).jpeg'], slug: 'silk-mix-stole', n: 'Silk-Mix Printed Stole', b: 'Boho Threads', c: 'accessories', sc: 'Scarves', p: 26, op: 34, r: 4.5, rv: 56, sz: ['One Size'], co: ['Emerald', 'Sage'], t: ['stole', 'silk-mix', 'printed'], po: 49, isNew: true },
{ s: ['bag.jpeg'], slug: 'slouchy-leather-handbag', n: 'Slouchy Leather Handbag', b: 'Mirabeau', c: 'bags', sc: 'Handbags', p: 62, op: 80, r: 4.6, rv: 66, sz: ['One Size'], co: ['Tan', 'Brown'], t: ['handbag', 'leather', 'slouchy'], po: 59, isNew: false },
{ s: ['polymer clay'], slug: 'polymer-clay-earrings', n: 'Polymer Clay Earrings', b: 'Kala Kendra', c: 'jewellery', sc: 'Earrings', p: 21, op: null, r: 4.7, rv: 89, sz: ['One Size'], co: ['Multicolour'], t: ['polymer-clay', 'handmade', 'statement'], po: 65, isNew: true },
{ s: ['jules ambrose'], slug: 'jules-blazer', n: 'Jules Monochrome Blazer', b: 'Estrella', c: 'clothing', sc: 'Blazers', p: 88, op: 110, r: 4.7, rv: 54, sz: ['S', 'M', 'L', 'XL'], co: ['Black', 'White'], t: ['blazer', 'tailoring', 'womenswear'], po: 55, isNew: false },
{ s: ['lorelai gilmore'], slug: 'lorelai-co-ord', n: 'Lorelai Knit Co-ord', b: 'Boho Threads', c: 'clothing', sc: 'Sets', p: 54, op: 70, r: 4.6, rv: 61, sz: ['S', 'M', 'L', 'XL'], co: ['Sage', 'Blush'], t: ['co-ord', 'knit', 'cozy'], po: 52, isNew: false },
{ s: ['vintage lily lamp'], slug: 'vintage-lily-lamp', n: 'Vintage Lily Table Lamp', b: 'Terracotta Tales', c: 'home', sc: 'Lighting', p: 66, op: 84, r: 4.8, rv: 71, sz: ['One Size'], co: ['Gold', 'Cream'], t: ['lamp', 'vintage', 'lily'], po: 67, isNew: true },
];


  /* ---- manual renames / recategorisations (by slug) ---- */
  const OVERRIDES = {
    "macrame-wall-hanging": { n: "White Co-ord Set", c: "clothing", sc: "Sets", sz: ["32", "34", "36", "38", "40"], co: ["White"], t: ["co-ord", "white", "cotton"] },
    "handloom-table-runner": { n: "Star Bag", c: "bags", sc: "Shoulder", sz: ["One Size"], co: ["Gold", "Black"], t: ["bag", "star", "evening"] },
    "ceramic-coaster-set": { n: "Indian Print Shoes", c: "shoes", sc: "Flats", sz: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"], co: ["Multicolour"], t: ["indian-print", "flats", "ethnic"] },
    "mango-wood-decor": { n: "Tulip Pearl Earrings", c: "jewellery", sc: "Earrings", sz: ["One Size"], co: ["Pearl"], t: ["pearl", "tulip", "earrings"] },
    "block-print-cushion-duo": { n: "Silver Mesh Heels", c: "shoes", sc: "Heels", sz: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"], co: ["Silver"], t: ["heels", "mesh", "party"] },
    "alibox-gift-bundle": { n: "Embroidered Black Lace Shoes", c: "shoes", sc: "Flats", sz: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"], co: ["Black"], t: ["embroidered", "lace", "black"] },
    "collectors-ceramic-vessel": { n: "Ceramic Earrings", c: "jewellery", sc: "Earrings", sz: ["One Size"], co: ["Terracotta", "Cream"], t: ["ceramic", "earrings", "handmade"] },
    "terracotta-planter-pot": { n: "Brown Zara Top", c: "clothing", sc: "Tops", sz: ["32", "34", "36", "38", "40"], co: ["Brown"], t: ["top", "brown", "casual"] },
    "embroidered-cushion-cover": { n: "Blue Formal Pants", c: "clothing", sc: "Trousers", sz: ["26", "28", "30", "32", "34"], co: ["Blue"], t: ["formal", "trousers", "blue"] },
    "indigo-block-print-dress": { n: "Indigo Block-Print Shirt", c: "clothing", sc: "Shirts", sz: ["32", "34", "36", "38", "40"], co: ["Indigo"], t: ["block-print", "shirt", "indigo"] },
    "everyday-leather-tote": { n: "Everyday Backpack", c: "bags", sc: "Backpacks", sz: ["One Size"], co: ["Black", "Tan"], t: ["backpack", "everyday", "leather"] },
    "satin-slip-dress": { n: "Hand-Painted Dystopian T-Shirt", c: "clothing", sc: "Tees", sz: ["32", "34", "36", "38", "40"], co: ["Multicolour"], t: ["hand-painted", "graphic", "tee"] },
    "waxed-canvas-backpack": { n: "Bedazzled Boots", c: "shoes", sc: "Boots", sz: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9"], co: ["Silver", "Black"], t: ["boots", "bedazzled", "party"] },
    "oxidised-jhumka-set": { n: "Clockwork Heels", c: "shoes", sc: "Heels", sz: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"], co: ["Gold", "Black"], t: ["heels", "clockwork", "statement"] },
    "printed-midi-skirt": { n: "Block-Printed Jeans", c: "clothing", sc: "Jeans", sz: ["26", "28", "30", "32", "34"], co: ["Indigo"], t: ["block-print", "jeans", "denim"] },
    "bloom-print-kurta": { n: "Sun & Moon Earrings", c: "jewellery", sc: "Earrings", sz: ["One Size"], co: ["Gold", "Silver"], t: ["celestial", "earrings", "gold"] },
    "golden-jhumka-earrings": { n: "Classic Jean Dress", c: "clothing", sc: "Dresses", sz: ["32", "34", "36", "38", "40"], co: ["Denim"], t: ["denim", "dress", "classic"] },
    "matte-hoop-earrings": { n: "Hand-Painted Sneakers", c: "shoes", sc: "Sneakers", sz: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10"], co: ["White", "Multicolour"], t: ["sneakers", "hand-painted", "custom"] },
    "paisley-cotton-duffel": { n: "Jean Co-ord Set", c: "clothing", sc: "Sets", sz: ["32", "34", "36", "38", "40"], co: ["Denim"], t: ["co-ord", "denim", "set"] },
    "embroidered-festive-flats": { n: "Blush Liquid Tint", c: "beauty", sc: "Makeup", sz: ["One Size"], co: [], t: ["blush", "makeup", "liquid-tint"] },
    "leather-crossbody-mini": { n: "Indian Maxi Skirt", c: "clothing", sc: "Skirts", sz: ["32", "34", "36", "38", "40"], co: ["Multicolour"], t: ["maxi-skirt", "indian-print", "ethnic"] },
    "ankle-strap-flats": { n: "Embroidered Ankle-Strap Boots", c: "shoes", sc: "Boots", sz: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"], co: ["Black", "Gold"], t: ["boots", "embroidered", "ankle"] },
    "slouchy-leather-handbag": { n: "Slouchy Denim Handbag", c: "bags", sc: "Handbags", sz: ["One Size"], co: ["Denim"], t: ["handbag", "denim", "slouchy"] },
    "handloom-midi-skirt": { n: "Designer Indian-Print Bag", c: "bags", sc: "Handbags", sz: ["One Size"], co: ["Multicolour"], t: ["bag", "indian-print", "designer"] },
    "handpainted-boho-blouse": { n: "Clay Hand-Painted Earrings", c: "jewellery", sc: "Earrings", sz: ["One Size"], co: ["Multicolour"], t: ["clay", "earrings", "handpainted"] },
    "knotted-silk-band": { n: "Dragonfly Earrings", c: "jewellery", sc: "Earrings", sz: ["One Size"], co: ["Antique Gold"], t: ["dragonfly", "earrings", "boho"] },
    "canvas-weekender-tote": { n: "Formal Striped Pants", c: "clothing", sc: "Trousers", sz: ["26", "28", "30", "32", "34"], co: ["Blue", "Grey"], t: ["formal", "striped", "trousers"] },
    "jules-blazer": { n: "YSL Lipstick", c: "beauty", sc: "Makeup", sz: ["One Size"], co: [], t: ["lipstick", "makeup", "luxe"] },
    "co-ord-lounge-set": { n: "Cotton Lounge Shirt", c: "clothing", sc: "Shirts", sz: ["32", "34", "36", "38", "40"], co: ["Cream"], t: ["lounge", "shirt", "cotton"] },
    "brass-leaf-brooch": { n: "Denim Designer Tie", c: "accessories", sc: "Ties", sz: ["One Size"], co: ["Denim"], t: ["tie", "denim", "formal"] },
    "printed-chiffon-scarf": { n: "Printed Summer Dress", c: "clothing", sc: "Dresses", sz: ["32", "34", "36", "38", "40"], co: ["Multicolour"], t: ["dress", "summer", "printed"] },
    "chiffon-dupatta": { n: "Maroon Fish-Eye Leather Heels", c: "shoes", sc: "Heels", sz: ["UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8"], co: ["Maroon"], t: ["heels", "leather", "maroon"] },
    "satin-quilted-pouch": { n: "Eyeshadow Palette", c: "beauty", sc: "Makeup", sz: ["One Size"], co: [], t: ["eyeshadow", "palette", "makeup"] },
    "printed-fleece-hoodie": { n: "Celestial Bodies Necklace", c: "jewellery", sc: "Necklaces", sz: ["One Size"], co: ["Gold"], t: ["necklace", "celestial", "gold"] },
    "batik-crop-top": { n: "Wire Earrings", c: "jewellery", sc: "Earrings", sz: ["One Size"], co: ["Silver", "Gold"], t: ["wire", "earrings", "minimal"] },
    "spiderman-custom-tee": { n: "Custom Spider Jeans", c: "clothing", sc: "Jeans", sz: ["26", "28", "30", "32", "34"], co: ["Indigo"], t: ["custom", "jeans", "graphic"] },
    "chunky-bead-bracelet": { n: "Sunflower-Pattern Denim Jeans", c: "clothing", sc: "Jeans", sz: ["26", "28", "30", "32", "34"], co: ["Blue"], t: ["sunflower", "jeans", "denim"] },
    "bafta-embroidered-top": { n: "Dual-Color Handbag", c: "bags", sc: "Handbags", sz: ["One Size"], co: ["Black", "Tan"], t: ["handbag", "dual-tone", "everyday"] },
    "silk-mix-stole": { n: "Ocean-Scented Candles", c: "home", sc: "Scent", sz: ["One Size"], co: [], t: ["candle", "ocean", "home"] },
    "bleach-streetwear-tee": { n: "Trendy Bleach Crop Top", c: "clothing", sc: "Tops", sz: ["32", "34", "36", "38", "40"], co: ["Black"], t: ["bleach", "crop", "streetwear"] },
    "lorelai-co-ord": { n: "Vintage Phone Ring", c: "accessories", sc: "Phone", sz: ["One Size"], co: ["Gold", "Silver"], t: ["phone-ring", "vintage", "accessory"] },
  };
  CATALOG.forEach(e => { if (OVERRIDES[e.slug]) Object.assign(e, OVERRIDES[e.slug]); });

/* slugs removed from the catalog */
const EXCLUDE = new Set(['batik-crop-top']);

/* ---------- locate + copy source files ---------- */
const mainFiles = fs.readdirSync(SRC).filter(f => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg'));
const sub = path.join(SRC, 'untitled folder');
const subFiles = fs.readdirSync(sub).filter(f => f.toLowerCase().endsWith('.jpeg') || f.toLowerCase().endsWith('.jpg'));

function findSrc(entry) {
  const norm = x => String(x).toLowerCase().replace(/[^a-z0-9]/g, '');
  // 0) a file named exactly after the product wins (any folder)
  const want = norm(entry.n);
  for (const f of mainFiles.concat(subFiles)) {
    if (norm(f.replace(/\.[^.]+$/, '')) === want) {
      return mainFiles.includes(f) ? path.join(SRC, f) : path.join(sub, f);
    }
  }
  // 1) otherwise use the original hint match
  const pool = entry.s.includes('untitled') ? subFiles : mainFiles;
  for (const f of pool) {
    if (entry.s.includes('untitled')) {
      if (entry.s.filter(t => t !== 'untitled').every(t => f.includes(t))) return path.join(sub, f);
    } else if (entry.s.every(t => f.includes(t))) return path.join(SRC, f);
  }
  return null;
}

/* ---------- resale layer: conditions, student sellers, pricing, listing age ---------- */
const CONDITIONS = ['Like New', 'Like New', 'Excellent', 'Excellent', 'Good', 'Fair'];
const SELLERS = [
  { name: 'Aditi Rao',      username: 'aditi.r',   rating: 4.9, sales: 31, responseRate: 98, responseTime: 'within an hour' },
  { name: 'Ananya Iyer',    username: 'ananya.i',  rating: 4.8, sales: 12, responseRate: 95, responseTime: 'same day' },
  { name: 'Rhea Kapoor',    username: 'rhea.k',    rating: 4.7, sales: 19, responseRate: 90, responseTime: 'within a few hours' },
  { name: 'Diya Menon',     username: 'diya.m',    rating: 5.0, sales: 8,  responseRate: 100, responseTime: 'within an hour' },
  { name: 'Ishaan Verma',   username: 'ishaan.v',  rating: 4.6, sales: 24, responseRate: 88, responseTime: 'same day' },
  { name: 'Kabir Shah',     username: 'kabir.s',   rating: 4.4, sales: 15, responseRate: 82, responseTime: 'within a day' },
  { name: 'Meera Nair',     username: 'meera.n',   rating: 4.9, sales: 27, responseRate: 97, responseTime: 'within a few hours' },
  { name: 'Nikhil Bose',    username: 'nikhil.b',  rating: 4.3, sales: 6,  responseRate: 78, responseTime: 'within a day' },
  { name: 'Aisha Khan',     username: 'aisha.k',   rating: 4.8, sales: 22, responseRate: 93, responseTime: 'same day' },
  { name: 'Rohit Desai',    username: 'rohit.d',   rating: 4.5, sales: 11, responseRate: 85, responseTime: 'within a few hours' },
  { name: 'Sanya Gupta',    username: 'sanya.g',   rating: 4.7, sales: 16, responseRate: 91, responseTime: 'same day' },
  { name: 'Vivaan Joshi',   username: 'vivaan.j',  rating: 4.2, sales: 4,  responseRate: 74, responseTime: 'within a day' },
  { name: 'Tara Pillai',    username: 'tara.p',    rating: 4.9, sales: 35, responseRate: 99, responseTime: 'within an hour' },
  { name: 'Arjun Reddy',    username: 'arjun.r',   rating: 4.6, sales: 18, responseRate: 87, responseTime: 'same day' },
  { name: 'Zoya Sheikh',    username: 'zoya.s',    rating: 4.8, sales: 13, responseRate: 94, responseTime: 'within a few hours' },
  { name: 'Dev Malhotra',   username: 'dev.m',     rating: 4.4, sales: 9,  responseRate: 80, responseTime: 'within a day' },
  { name: 'Kavya Rao',      username: 'kavya.r',   rating: 4.7, sales: 21, responseRate: 92, responseTime: 'same day' },
  { name: 'Yash Patel',     username: 'yash.p',    rating: 4.3, sales: 7,  responseRate: 76, responseTime: 'within a day' },
  { name: 'Mira Sen',       username: 'mira.s',    rating: 4.9, sales: 29, responseRate: 96, responseTime: 'within an hour' },
  { name: 'Neel Bhatia',    username: 'neel.b',    rating: 4.5, sales: 14, responseRate: 84, responseTime: 'within a few hours' },
  { name: 'Ananya Gokhale', username: 'ananya.g',  rating: 4.8, sales: 17, responseRate: 93, responseTime: 'same day' },
  { name: 'Riya Chatterjee',username: 'riya.c',    rating: 4.6, sales: 10, responseRate: 89, responseTime: 'within a few hours' }
];
const PRICE_BAND = { clothing: [199, 899], shoes: [399, 1299], bags: [349, 999], jewellery: [149, 599], beauty: [149, 499], home: [199, 799], accessories: [149, 499], books: [99, 399] };
function hashStr(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return Math.abs(h); }
function resalePrice(cat, h) { const band = PRICE_BAND[cat] || [199, 899]; const steps = Math.floor((band[1] - band[0]) / 50) + 1; return Math.round((band[0] + (h % steps) * 50) / 10) * 10; }

/* no items are re-named: every listing keeps its original name */
const CONVERT = {};

fs.mkdirSync(DEST, { recursive: true });
const used = new Set();
const lines = [];
const q = JSON.stringify;
let i = 0;

for (const e of CATALOG) {
  if (EXCLUDE.has(e.slug)) continue;
  const srcPath = findSrc(e);
  const srcFile = srcPath ? path.basename(srcPath) : null;
  if (!srcFile) { console.error('!! no source for', e.n, entryHints(e.s)); process.exit(1); }
  const ext = 'jpg';
  const outName = e.slug + '.' + ext;
  if (used.has(outName)) { console.error('!! duplicate slug', outName); process.exit(1); }
  used.add(outName);
  fs.copyFileSync(srcPath, path.join(DEST, outName));
  const image = 'images/aclothes/' + outName;
  /* re-home a few listings as books/study items */
  if (CONVERT[e.slug]) Object.assign(e, CONVERT[e.slug]);

  const h = hashStr(e.slug);
  const seller = SELLERS[i % SELLERS.length];
  const condition = CONDITIONS[h % CONDITIONS.length];
  const listedDaysAgo = h % 30;

  /* Indian standard sizes: convert letter sizes to Indian numerics */
  const SIZE_MAP = { XS: '32', S: '34', M: '36', L: '38', XL: '40', XXL: '42' };
  const sizes = e.sz.map(s => SIZE_MAP[s] || s);

  /* student-friendly resale price */
  const price = resalePrice(e.c, h);

  const desc = `${e.n} · ${condition} condition · listed by ${seller.name} (${seller.username}). Pick up on campus: coordinate the handoff with the seller after checkout.`;

  lines.push(`
    {
      id: ${q(e.slug)},
      name: ${q(e.n)},
      brand: ${q(e.b)},
      category: ${q(e.c)},
      subcategory: ${q(e.sc)},
      price: ${price},
      condition: ${q(condition)},
      listedDaysAgo: ${listedDaysAgo},
      seller: { name: ${q(seller.name)}, username: ${q(seller.username)}, email: ${q(seller.username + '@ashoka.edu.in')}, rating: ${seller.rating}, sales: ${seller.sales}, responseRate: ${seller.responseRate}, responseTime: ${q(seller.responseTime)}, university: 'Ashoka University' },
      originalPrice: null,
      rating: ${e.r},
      reviews: ${e.rv},
      popularity: ${e.po},
      isNew: ${e.isNew},
      tags: ${q(e.t)},
      colors: ${q(e.co)},
      sizes: ${q(sizes)},
      images: [${q(image)}],
      description: ${q(desc)}
    }`);
  i++;
}

/* ---------- write js/products.js ---------- */
let out = `/* ============================================================
   Bloom · Product dataset (auto-generated from images/aclothes)
   Regenerate with: node scripts/build-catalog.js
   ============================================================ */

;(function () {
  'use strict';

  const PRODUCTS = [${lines.join(',')}
  ];

  const CATEGORY_META = {
    clothing:    { name: 'Clothing',          icon: 'dress',   tagline: 'The student closet', weight: 1 },
    shoes:       { name: 'Footwear',          icon: 'shoe',    tagline: 'Sneakers, heels & more', weight: 2 },
    bags:        { name: 'Bags',              icon: 'bag',     tagline: 'Carry it on', weight: 3 },
    jewellery:   { name: 'Jewellery',         icon: 'ring',    tagline: 'Little treasures', weight: 4 },
    beauty:      { name: 'Beauty',            icon: 'flower',  tagline: 'Self-care shelf', weight: 5 },
    accessories: { name: 'Accessories',       icon: 'glasses', tagline: 'Finishing touches', weight: 6 },
    home:        { name: 'Dorm & Decor',      icon: 'home',    tagline: 'For your room', weight: 7 },
    books:       { name: 'Books & Academics', icon: 'book',    tagline: 'Study essentials', weight: 8 }
  };

  /* materialise the discount field (per requirement) */
  PRODUCTS.forEach(p => {
    p.discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
  });

  window.CATEGORY_META = CATEGORY_META;
  window.COUPONS = {
    FLEUR10:  { kind: 'percent', value: 10, label: '10% off · FLEUR10' },
    BLOOM15:  { kind: 'percent', value: 15, minSpend: 4999, label: '15% off · BLOOM15' },
    PETAL20:  { kind: 'percent', value: 20, minSpend: 9999, label: '20% off · PETAL20' },
    FREESHIP: { kind: 'shipping', value: 0, label: 'Free delivery · FREESHIP' }
  };

  window.PRODUCTS = PRODUCTS;

  window.getProduct = function (id) {
    return PRODUCTS.find(function (p) { return p.id === id; }) || null;
  };

  window.relatedProducts = function (product, count) {
    var list = PRODUCTS.filter(function (p) {
      return p.id !== product.id && p.category === product.category;
    });
    if (list.length < count) {
      list = list.concat(PRODUCTS.filter(function (p) {
        return list.indexOf(p) === -1 && p.id !== product.id;
      }));
    }
    return list.slice(0, count);
  };
})();
`;
fs.writeFileSync(path.join(ROOT, 'js', 'products.js'), out);
console.log('Copied', CATALOG.length, 'images to images/aclothes and wrote js/products.js');

function entryHints(s) { return s.join('|'); }