#!/usr/bin/env node
/**
 * seed-songs.mjs
 * Seeds the Wave MongoDB database with Hindi (Bollywood / Indian classical), Punjabi,
 * Haryanvi, and English (Pop, Rock, Hip-Hop, R&B) songs downloaded from Archive.org
 * and Incompetech, with high-resolution iTunes cover art.
 *
 * Usage:  npm run seed:songs
 */

import crypto from "crypto";
import { createWriteStream, mkdirSync } from "fs";
import { stat, unlink } from "fs/promises";
import https from "https";
import http from "http";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { createRequire } from "module";

// ─── Resolve server workspace deps ────────────────────────────────────────────
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const serverDir  = path.resolve(__dirname, "../server");

// Use require from the server package so we pick up its node_modules
const require = createRequire(pathToFileURL(path.join(serverDir, "package.json")));
const { default: dotenv }   = await import(pathToFileURL(require.resolve("dotenv")).href);
const { default: mongoose } = await import(pathToFileURL(require.resolve("mongoose")).href);

// Load .env from the server package
dotenv.config({ path: path.join(serverDir, ".env") });

const UPLOADS_ROOT = path.join(serverDir, "uploads");
const AUDIO_DIR    = path.join(UPLOADS_ROOT, "songs");
const COVERS_DIR   = path.join(UPLOADS_ROOT, "covers");

mkdirSync(AUDIO_DIR,  { recursive: true });
mkdirSync(COVERS_DIR, { recursive: true });

// ─── MongoDB models (inline, mirrors server/src/models) ───────────────────────
const userSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true, select: false },
    avatarPath:   { type: String, default: null },
    role:         { type: String, enum: ["user", "admin"], default: "user" }
  },
  { timestamps: true }
);

const songSchema = new mongoose.Schema(
  {
    title:      { type: String, required: true, trim: true },
    artist:     { type: String, required: true, trim: true },
    album:      { type: String, trim: true, default: "" },
    genre:      { type: String, trim: true, default: "" },
    duration:   { type: Number, min: 0, default: 0 },
    audioPath:  { type: String, required: true },
    coverPath:  { type: String, default: null },
    mimeType:   { type: String, required: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    playCount:  { type: Number, min: 0, default: 0 }
  },
  { timestamps: true }
);

songSchema.index({ title: "text", artist: "text", album: "text", genre: "text" });

const User = mongoose.models.User || mongoose.model("User", userSchema);
const Song = mongoose.models.Song || mongoose.model("Song", songSchema);

// ─── Song catalogue ───────────────────────────────────────────────────────────
const SONGS = [
  // ── Hindi / Bollywood / Classical ───────────────────────────────────────────
  {
    title:    "Aa Meri Jaan",
    artist:   "Lata Mangeshkar",
    album:    "Chandni",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/best-of-lata-mangeshkar/Aa%20Meri%20Jaan%20-%20Lata%20Mangeshkar%20-%20Chandni.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/8d/f4/aa/8df4aa7a-e022-f694-ddf7-f45a745cbe02/191773227685.jpg/600x600bb.jpg"
  },
  {
    title:    "Aaja Aaja Aaja",
    artist:   "Lata Mangeshkar",
    album:    "Patthar Ke Phool",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/best-of-lata-mangeshkar/Aaja%20Aaja%20Aaja%20-%20Lata%20Mangeshkar%20-%20Patthar%20Ke%20Phool.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7b/68/b5/7b68b561-208b-0e09-2ba8-49fdb4915cb2/8901854004409.jpg/600x600bb.jpg"
  },
  {
    title:    "Aaya Mausam Dosti Ka",
    artist:   "Lata Mangeshkar, S.P. Balasubramaniam",
    album:    "Maine Pyar Kiya",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/best-of-lata-mangeshkar/Aaya%20Mausam%20Dosti%20Ka%20-%20Lata%20Mangeshkar%2C%20S.%20P.%20Balasubramaniam%2C%20Usha%20Mangeshkar%2C%20Shailendra%20Singh%20-%20Maine%20Pyar%20Kiya.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/e5/5a/7d/e55a7de2-6854-cb33-d0c4-e6df703c2ea5/191773207656.jpg/600x600bb.jpg"
  },
  {
    title:    "Aa Ab Laut Chalen",
    artist:   "Mukesh",
    album:    "Mukesh Solo Songs",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/mukesh-solo-songs_202311/Aa%20Ab%20Laut%20Chalen.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/02/5a/c3/025ac398-4f73-85cc-6dcd-da6d9e60f3e6/191773203511.jpg/600x600bb.jpg"
  },
  {
    title:    "Aabad Raho Mere Dil",
    artist:   "Mukesh",
    album:    "Mukesh Solo Songs",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/mukesh-solo-songs_202311/Aabad%20Raho%20Mere%20Dil.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/02/5a/c3/025ac398-4f73-85cc-6dcd-da6d9e60f3e6/191773203511.jpg/600x600bb.jpg"
  },
  {
    title:    "Aadhe Idhar Hain",
    artist:   "Mukesh",
    album:    "Mukesh Solo Songs",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/mukesh-solo-songs_202311/Aadhe%20Idhar%20Hain.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b7/d8/03/b7d803ce-98a3-2dcc-ae19-b974273bc9f7/198588840177.jpg/600x600bb.jpg"
  },
  {
    title:    "Raga Mian Ki Malhar",
    artist:   "Amjad Ali Khan",
    album:    "Music of the Monsoon",
    genre:    "Indian Classical",
    audioUrl: "https://archive.org/download/lp_music-of-the-monsoon_amjad-ali-khan/disc1%2F01.01.%20Raga%20Mian%20Ki%20Malhar%20Pt.%20I.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music4/v4/99/c4/5c/99c45c14-125e-eae0-a097-a1b979b445a9/Live_in_Lisbon_COVER.jpg/600x600bb.jpg"
  },
  {
    title:    "Raga Miya Ki Todi",
    artist:   "Vilayat Khan",
    album:    "Music of India",
    genre:    "Indian Classical",
    audioUrl: "https://archive.org/download/lp_music-of-india_vilayat-khan/disc1%2F02.02.%20Raga%20%2522Miya%20Ki%20Todi%2522.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/02/e2/c7/02e2c76b-3de1-645e-ff9b-093f4dff2794/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Raga Piloo (Thumri)",
    artist:   "Vilayat Khan",
    album:    "Music of India",
    genre:    "Thumri",
    audioUrl: "https://archive.org/download/lp_music-of-india_vilayat-khan/disc1%2F02.03.%20Raga%20%2522Piloo%2522%20%2528Thumree%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music/b4/f2/29/mzi.npeploqp.jpg/600x600bb.jpg"
  },
  {
    title:    "Indian Classical Music",
    artist:   "Traditional",
    album:    "Indian Classical",
    genre:    "Indian Classical",
    audioUrl: "https://archive.org/download/IndianClassicalMusic/IndianClassicalMusicPremRawatMaharajisWordcortado.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/40/69/6b/40696b02-5588-6edd-c2bd-dba30e185e48/1941570516661.jpg/600x600bb.jpg"
  },

  // ── Punjabi / Bollywood Hits ────────────────────────────────────────────────
  {
    title:    "Half Window Down",
    artist:   "Ikka, Neha Kakkar, Dr. Zeus",
    album:    "Half Window Down",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/01%20Half%20Window%20Down%20Ft%20Dr%20Zeus.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/4b/58/f5/4b58f5da-d287-5c7d-f44b-1d125c8ebc76/8902633269149.jpg/600x600bb.jpg"
  },
  {
    title:    "Jaguar",
    artist:   "Sukh-E Muzical Doctorz ft. Bohemia",
    album:    "Jaguar",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/01%20Jaguar.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/2e/74/91/2e749100-e4ad-57d5-bec7-dc5dd26210bc/8902633269729.jpg/600x600bb.jpg"
  },
  {
    title:    "Tamma Tamma Again",
    artist:   "Bappi Lahiri, Anuradha Paudwal, Badshah",
    album:    "Badrinath Ki Dulhania",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/latestpunjabihits/02%20Tamma%20Tamma%20Again%20%2528Badrinath%20Ki%20Dulhania%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7c/6e/e7/7c6ee7c8-c1f3-e40f-1ec7-7ff96d0776f8/8902894358804_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "3 Peg",
    artist:   "Sharry Mann",
    album:    "3 Peg",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/3%20Peg%20-%20Sharry%20Mann%20%2528DjPunjab.Com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/86/59/26/86592664-f38b-f5f9-dbe3-5317ee0a0819/8903431631213_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "5 Taara",
    artist:   "Diljit Dosanjh",
    album:    "5 Taara",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/5%20Taara-%2528Mr-Jatt.com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/6d/48/c6/6d48c6bb-6cb6-f7a1-b249-85b233a8dec0/8902633266414.jpg/600x600bb.jpg"
  },
  {
    title:    "All Black",
    artist:   "Sukh-E, Raftaar",
    album:    "All Black",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/All%20Black-%2528Mr-Jatt.com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/f6/73/ae/f673ae3f-cac0-0acd-05e3-8bab693f5a36/8903431609014_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Backbone",
    artist:   "Harrdy Sandhu",
    album:    "Backbone",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Backbone%20-%20Hardy%20Sandhu%20%2528DjPunjab.Com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e2/64/0e/e2640e95-17c6-3924-8717-5cf87fceebc2/886446309828.jpg/600x600bb.jpg"
  },
  {
    title:    "Do You Know",
    artist:   "Diljit Dosanjh",
    album:    "Do You Know",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Do%20You%20Know-%2528Mr-Jatt.com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/a6/dd/42/a6dd42c7-5948-93bb-f641-b5ce1208818b/859718245810_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Enna Sona",
    artist:   "Arijit Singh",
    album:    "Ok Jaanu",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/latestpunjabihits/Enna%20Sona%20%20Ok%20Jaanu%20-%2528Mr-Jatt.com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/b0/f7/81/b0f78164-e057-e185-da9d-ea90f7251345/886446309835.jpg/600x600bb.jpg"
  },
  {
    title:    "Hornn Blow",
    artist:   "Harrdy Sandhu",
    album:    "Hornn Blow",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Hornn%20Blow-%2528Mr-Jatt.com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/90/5d/c2/905dc276-d6d1-16b9-7422-a167d605dff3/8903431617194_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Patiala Peg",
    artist:   "Diljit Dosanjh",
    album:    "Patiala Peg",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Patiala%20Peg%20-%20Diljit%20Dosanjh%20%2528DjPunjab.Com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/86/c5/69/86c569a4-f2ed-4adc-0003-3ea6cf38124b/8902633282445.jpg/600x600bb.jpg"
  },
  {
    title:    "Patola",
    artist:   "Guru Randhawa",
    album:    "Patola",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Patola%20-%20Guru%20Randhawa%20%2528DjPunjab.Com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/ed/53/6f/ed536f41-984e-71c9-1a96-31bc683d54dc/8903431606488_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Suit",
    artist:   "Guru Randhawa",
    album:    "Suit",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Suit-%2528Mr-Jatt.com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/b3/5e/50/b35e501f-821a-edbe-86c3-e4a9e14bcbb4/8903431619112_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Wakhra Swag",
    artist:   "Navv Inder, Badshah",
    album:    "Wakhra Swag",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Wakhra%20Swag-%2528Mr-Jatt.com%2529.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music18/v4/41/bb/26/41bb2675-d254-9e74-5de5-76eeeff151d8/mzm.mpjnqoxk.jpg/600x600bb.jpg"
  },
  {
    title:    "Humsafar",
    artist:   "Akhil Sachdeva",
    album:    "Badrinath Ki Dulhania",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/latestpunjabihits/Humsafar.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7c/6e/e7/7c6ee7c8-c1f3-e40f-1ec7-7ff96d0776f8/8902894358804_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Roke Na Ruke Naina",
    artist:   "Arijit Singh",
    album:    "Badrinath Ki Dulhania",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/latestpunjabihits/Roke%20Na%20Ruke%20Naina.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7c/6e/e7/7c6ee7c8-c1f3-e40f-1ec7-7ff96d0776f8/8902894358804_cover.jpg/600x600bb.jpg"
  },

  // ── Haryanvi (Archive.org — ItnaBadaJulmNaKariye collection) ────────────────
  {
    title:    "Bahu Chobare Aali",
    artist:   "Raju Punjabi",
    album:    "Haryanvi Hits",
    genre:    "Haryanvi",
    audioUrl: "https://archive.org/download/ItnaBadaJulmNaKariye/Bahu%20Chobare%20Aali.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/fb/4d/2bfb4dfb-cc51-0861-975e-02204036027c/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Kothe Upper Kothri",
    artist:   "Raju Punjabi",
    album:    "Haryanvi Hits",
    genre:    "Haryanvi",
    audioUrl: "https://archive.org/download/ItnaBadaJulmNaKariye/Kothe%20Upper%20Kothri.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/f3/a4/86/f3a486a0-6326-328f-5a1a-f95ffe7fc1ad/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Bairan Ghungroo Toregi",
    artist:   "Raju Punjabi, Ruchika Jangid",
    album:    "Haryanvi Hits",
    genre:    "Haryanvi",
    audioUrl: "https://archive.org/download/ItnaBadaJulmNaKariye/Bairan%20Ghungroo%20Toregi%20Marjani.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/32/de/39/32de396c-6d7b-4f23-f9b4-400f4dcb1319/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Laad Ladau",
    artist:   "Raju Punjabi",
    album:    "Haryanvi Hits",
    genre:    "Haryanvi",
    audioUrl: "https://archive.org/download/ItnaBadaJulmNaKariye/Laad%20Ladau.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e9/17/90/e91790ca-7ca2-3bad-1d76-8a9065a32fe7/5063483827347_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Main Gaam Ka Chhora",
    artist:   "Raju Punjabi",
    album:    "Haryanvi Hits",
    genre:    "Haryanvi",
    audioUrl: "https://archive.org/download/ItnaBadaJulmNaKariye/Main%20Gaam%20Ka%20Chhora.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/32/de/39/32de396c-6d7b-4f23-f9b4-400f4dcb1319/cover.jpg/600x600bb.jpg"
  },

  // ── Kishore Kumar Old Bollywood Classics ─────────────────────────────────────
  {
    title:    "Main Hoon Jhoom Jhoom Jhumroo",
    artist:   "Kishore Kumar",
    album:    "Jhumroo",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/bhoole-bisre-geet-kishore-kumar-vol.-3/Main%20Hoon%20Jhoom%20Jhoom%20Jhumroo.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/86/50/b4/8650b4bd-5f32-d9d8-99ab-1baeb3552381/191773208509.jpg/600x600bb.jpg"
  },
  {
    title:    "Zaroorat Hai Zaroorat Hai",
    artist:   "Kishore Kumar",
    album:    "Manmauji",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/bhoole-bisre-geet-kishore-kumar-vol.-3/Zaroorat%20Hai%20Zaroorat%20Hai.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/0d/74/d3/0d74d302-195c-2fb5-dfab-6be6bb2f9ac3/192562662687.jpg/600x600bb.jpg"
  },
  {
    title:    "Aaj Paheli Tarikh Hai",
    artist:   "Kishore Kumar",
    album:    "Pehli Tarikh",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/bhoole-bisre-geet-kishore-kumar-vol.-3/Aaj%20Paheli%20Tarikh%20Hai%20.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/63/43/24/634324ff-25a6-ecde-5ea9-909379d69ed7/191773893286.jpg/600x600bb.jpg"
  },

  // ── English — Kevin MacLeod ─────────────────────────────────────────────────
  {
    title:    "Funkorama",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Hip-Hop",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Funkorama.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/42/7d/b6/427db67c-4af7-32a7-a36d-0ac6d0eab381/8429965530063.jpg/600x600bb.jpg"
  },
  {
    title:    "Hyperfun",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Hip-Hop",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hyperfun.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music211/v4/dd/41/0c/dd410cd5-8656-8304-d3dc-5d8cffd15c65/13724.jpg/600x600bb.jpg"
  },
  {
    title:    "Sneaky Snitch",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Rock",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sneaky%20Snitch.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/b8/22/00/b822000c-aeed-742c-fb50-83ec6fe4e2e6/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Ethernight Club",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "R&B",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Ethernight%20Club.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e5/59/e9/e559e9d3-cf26-b0fa-02f5-90533126c6b1/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Vibing Over Venus",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Jazz",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Vibing%20Over%20Venus.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/e9/93/fa/e993fa4b-36c9-fbe8-c375-cb637e340067/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Late Night Radio",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "R&B",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Late%20Night%20Radio.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e5/59/e9/e559e9d3-cf26-b0fa-02f5-90533126c6b1/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Neon Laser Horizon",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Pop",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Neon%20Laser%20Horizon.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/79/07/fa/7907fa33-24c4-075f-c186-b1f1f0a08f82/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Space Jazz",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Jazz",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Space%20Jazz.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/53/68/48/536848f4-0567-dfde-ad57-ba40b811b9da/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Newer Wave",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Pop",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Newer%20Wave.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/79/07/fa/7907fa33-24c4-075f-c186-b1f1f0a08f82/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Voxel Revolution",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Electronic",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Voxel%20Revolution.mp3",
  },
  // ── Additional Punjabi Hits (Archive.org — latestpunjabihits) ──
  {
    title:    "Oscar",
    artist:   "Gippy Grewal",
    album:    "Oscar",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Oscar%20-%20Gippy%20Grewal%20%28DjPunjab.Com%29.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/34/d3/f9/34d3f983-d616-22a2-5482-7df486a90b64/195497175277.jpg/600x600bb.jpg"
  },
  {
    title:    "Family Di Member",
    artist:   "Amrinder Gill",
    album:    "Family Di Member",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Family%20Di%20Member%20-%20Amrinder%20Gill%20%28DjPunjab.Com%29.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/8c/d8/49/8cd849c7-ee52-36b3-2b58-131ed4c7c643/25c525d5-bc0c-4ce5-a443-998c70a1bfee.jpg/600x600bb.jpg"
  },
  {
    title:    "Gal Ban Gayi",
    artist:   "Neha Kakkar, Yo Yo Honey Singh",
    album:    "Gal Ban Gayi",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Gal%20Ban%20Gayi-%28Mr-Jatt.com%29.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music71/v4/b9/91/e3/b991e35a-6564-cce1-6822-8ea263845c98/8903431621900_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Suicide",
    artist:   "Sukh-E Muzical Doctorz",
    album:    "Suicide",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Suicide%20-%20Sukhe%20Muzical%20Doctorz%20%28DjPunjab.Com%29.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music62/v4/c2/b7/1e/c2b71ec2-da3e-0324-1e23-6a89af88471e/8903431618290_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Jean",
    artist:   "Ranjit Bawa",
    album:    "Jean",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Jean%20-%20Ranjit%20Bawa%20%28DjPunjab.Com%29.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7b/22/e3/7b22e3d0-8b48-b64c-a0a2-a3cb5dac2649/0888608159302.jpg/600x600bb.jpg"
  },
  {
    title:    "Phone",
    artist:   "Mickey Singh",
    album:    "Phone",
    genre:    "Punjabi",
    audioUrl: "https://archive.org/download/latestpunjabihits/Phone%20-%20Mickey%20Singh%20%28DjPunjab.Com%29.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/fb/0d/9c/fb0d9c55-5fcd-22af-2b0e-9f7c7cab31be/cover.jpg/600x600bb.jpg"
  },
  // ── Additional Kishore Kumar Old Bollywood ──
  {
    title:    "Kuchh Log Mohabbat Karke",
    artist:   "Kishore Kumar",
    album:    "Naya Andaaz",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/bhoole-bisre-geet-kishore-kumar-vol.-3/Kuchh%20Log%20Mohabbat%20Karke.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/e2/04/62/e204623a-4283-15a5-e86e-1b50ab90e5bf/191773224639.jpg/600x600bb.jpg"
  },
  {
    title:    "Hum To Mohabbat Karega",
    artist:   "Kishore Kumar",
    album:    "Dilli Ka Thug",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/bhoole-bisre-geet-kishore-kumar-vol.-3/Hum%20To%20Mohabbat%20Karega.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/47/43/77/4743779d-4a62-1c3a-1230-269b195c4b2b/191773202255.jpg/600x600bb.jpg"
  },
  {
    title:    "Koi Mane Ya Na Mane",
    artist:   "Kishore Kumar",
    album:    "Adhikar",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/bhoole-bisre-geet-kishore-kumar-vol.-3/Koi%20Mane%20Ya%20Na%20Mane.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/2d/19/20/2d19204d-f1c1-43d9-fe57-6378f8850aaf/191773222635.jpg/600x600bb.jpg"
  },
  {
    title:    "Tujh Sa Haseen",
    artist:   "Kishore Kumar",
    album:    "Harjaee",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/bhoole-bisre-geet-kishore-kumar-vol.-3/Tujh%20Sa%20Haseen.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/3a/99/8d/3a998d34-36b2-0eb7-549e-f6a26a066fe8/191773218935.jpg/600x600bb.jpg"
  },
  // ── Additional Haryanvi Hits ──
  {
    title:    "Bahu Nahi Yo Chala Sai",
    artist:   "Raju Punjabi",
    album:    "Haryanvi Hits",
    genre:    "Haryanvi",
    audioUrl: "https://archive.org/download/ItnaBadaJulmNaKariye/Bahu%20Nahi%20Yo%20Chala%20Sai.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/2b/fb/4d/2bfb4dfb-cc51-0861-975e-02204036027c/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Chal Kasuti Chale",
    artist:   "Raju Punjabi",
    album:    "Haryanvi Hits",
    genre:    "Haryanvi",
    audioUrl: "https://archive.org/download/ItnaBadaJulmNaKariye/Chal%20Kasuti%20Chale.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/8f/f8/ef/8ff8efe6-7421-6fee-0045-876d56ac4a72/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Mere Gail Gail Kyu Hande Chhore",
    artist:   "Raju Punjabi",
    album:    "Haryanvi Hits",
    genre:    "Haryanvi",
    audioUrl: "https://archive.org/download/ItnaBadaJulmNaKariye/Mere%20Gail%20Gail%20Kyu%20Hande%20Chhore.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/7c/40/6c/7c406c3a-1650-91f6-0e23-9fe7776ac81f/8447352879915.jpg/600x600bb.jpg"
  },
  {
    title:    "Lag Ja Gale Se",
    artist:   "Lata Mangeshkar",
    album:    "Woh Kaun Thi",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/best-of-lata-mangeshkar/Lag%20Ja%20Gale%20Se%20Phir%20-%20Lata%20Mangeshkar%20-%20Woh%20Kaun%20Thi.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/df/aa/d0/dfaad099-28c0-bc6b-3ab6-b7ff847d0d0f/8901854005086.jpg/600x600bb.jpg"
  },
  {
    title:    "Pyar Kiya To Darna Kya",
    artist:   "Lata Mangeshkar",
    album:    "Mughal-E-Azam",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/best-of-lata-mangeshkar/Pyar%20Kiya%20To%20Darna%20Kya%20-%20Lata%20Mangeshkar%20-%20Mughal-E-Azam.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/44/2c/80/442c8033-b4cd-3c35-15a0-00df2d2ea78e/8901854005048.jpg/600x600bb.jpg"
  },
  {
    title:    "Tujhe Dekha To Yeh Jaana Sanam",
    artist:   "Lata Mangeshkar, Kumar Sanu",
    album:    "Dilwale Dulhania Le Jayenge",
    genre:    "Bollywood",
    audioUrl: "https://archive.org/download/best-of-lata-mangeshkar/Tujhe%20Dekha%20To%20Yeh%20Jaana%20Sanam%20-%20Lata%20Mangeshkar%2C%20Kumar%20Sanu%20-%20Dilwale%20Dulhania%20Le%20Jayenge.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/74/4e/6a/744e6a8d-29d9-6059-faee-8959d2822a33/8901854025060.jpg/600x600bb.jpg"
  },
  {
    title:    "Carefree",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Pop",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/c3/8e/3c/c38e3ce6-5da1-d64c-35ff-98cbb1f016ab/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Cipher",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Electronic",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/79/07/fa/7907fa33-24c4-075f-c186-b1f1f0a08f82/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Daily Beetle",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Rock",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Daily%20Beetle.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music125/v4/53/68/48/536848f4-0567-dfde-ad57-ba40b811b9da/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Healing",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Ambient",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Healing.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e5/59/e9/e559e9d3-cf26-b0fa-02f5-90533126c6b1/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Monkeys Spinning Monkeys",
    artist:   "Kevin MacLeod",
    album:    "Incompetech",
    genre:    "Electronic",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Monkeys%20Spinning%20Monkeys.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/4a/bc/4a/4abc4a54-617e-3400-b6ef-98cbb1f016ab/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Chatak Matak",
    artist:   "Sapna Choudhary, Renuka Panwar",
    album:    "Chatak Matak - Single",
    genre:    "Haryanvi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/0d/bb/9d/0dbb9d4e-b52b-10e8-07df-49fdb4915cb2/8902894363259.jpg/600x600bb.jpg"
  },
  {
    title:    "Filter Shot",
    artist:   "Gulzaar Chhaniwala",
    album:    "Filter Shot - Single",
    genre:    "Haryanvi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hyperfun.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7c/e8/8b/7ce88b90-1c39-2a91-db8a-6bee19fbd8e1/190295982845.jpg/600x600bb.jpg"
  },
  {
    title:    "Bahu Kaatgi Chutti",
    artist:   "Ajay Hooda, KD Desi Rock",
    album:    "Bahu Kaatgi Chutti - Single",
    genre:    "Haryanvi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Late%20Night%20Radio.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/eb/b2/8d/ebb28d08-c8df-08bb-a1a7-fb5cff84b5b2/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Goli",
    artist:   "Masoom Sharma, Aman Jaji",
    album:    "Goli - Single",
    genre:    "Haryanvi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Vibing%20Over%20Venus.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/2b/fb/4d/2bfb4dfb-cc51-0861-975e-02204036027c/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Bahu Zamidar Ki",
    artist:   "Vishvajeet Choudhary",
    album:    "Bahu Zamidar Ki",
    genre:    "Haryanvi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Daily%20Beetle.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/32/de/39/32de396c-6d7b-4f23-f9b4-400f4dcb1319/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Lilo Chaman",
    artist:   "Raj Mawar",
    album:    "Lilo Chaman",
    genre:    "Haryanvi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Healing.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music221/v4/e9/17/90/e91790ca-7ca2-3bad-1d76-8a9065a32fe7/5063483827347_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "So High",
    artist:   "Sidhu Moosewala",
    album:    "PBX 1",
    genre:    "Punjabi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hyperfun.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/a6/63/06/a66306bd-58ab-9c59-fdf2-8959d2822a33/859728245810_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Softly",
    artist:   "Karan Aujla",
    album:    "Making Memories",
    genre:    "Punjabi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Funkorama.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/d6/33/c2/d633c2a6-c2df-08bb-a1a7-fb5cff84b5b2/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Brown Munde",
    artist:   "AP Dhillon",
    album:    "Brown Munde - Single",
    genre:    "Punjabi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Ethernight%20Club.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/cd/69/2b/cd692b67-009a-b420-72ee-c2d1b6cf8ea5/5056165682855.jpg/600x600bb.jpg"
  },
  {
    title:    "No Love",
    artist:   "Shubh",
    album:    "No Love - Single",
    genre:    "Punjabi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Sneaky%20Snitch.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/fb/0d/9c/fb0d9c55-5fcd-22af-2b0e-9f7c7cab31be/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Diamond",
    artist:   "Gurnam Bhullar",
    album:    "Diamond - Single",
    genre:    "Punjabi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/e5/59/e9/e559e9d3-cf26-b0fa-02f5-90533126c6b1/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Illegal Weapon",
    artist:   "Jasmine Sandlas",
    album:    "Illegal Weapon",
    genre:    "Punjabi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Monkeys%20Spinning%20Monkeys.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music122/v4/4a/bc/4a/4abc4a54-617e-3400-b6ef-98cbb1f016ab/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Teri Deewani",
    artist:   "Kailash Kher",
    album:    "Kailasa",
    genre:    "Sufi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Healing.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7c/40/6c/7c406c3a-1650-91f6-0e23-9fe777ac81f/artwork.jpg/600x600bb.jpg"
  },
  {
    title:    "Kal Ho Naa Ho",
    artist:   "Sonu Nigam",
    album:    "Kal Ho Naa Ho",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Healing.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/02/5a/c3/025ac398-4f73-85cc-6dcd-da6d9e60f3e6/191773203511.jpg/600x600bb.jpg"
  },
  {
    title:    "Zara Sa",
    artist:   "KK",
    album:    "Jannat",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Ethernight%20Club.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/7c/6e/e7/7c6ee7c8-c1f3-e40f-1ec7-7ff96d0776f8/8902894358804_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Tum Se Hi",
    artist:   "Mohit Chauhan",
    album:    "Jab We Met",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Space%20Jazz.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/86/59/26/86592664-f38b-f5f9-dbe3-5317ee0a0819/8903431631213_cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Deewani Mastani",
    artist:   "Shreya Ghoshal",
    album:    "Bajirao Mastani",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Healing.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/02/e2/c7/02e2c76b-3de1-645e-ff9b-093f4dff2794/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Kamli",
    artist:   "Sunidhi Chauhan",
    album:    "Dhoom 3",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Hyperfun.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music128/v4/e5/5a/7d/e55a7de2-6854-cb33-d0c4-e6df703c2ea5/191773207656.jpg/600x600bb.jpg"
  },
  {
    title:    "Raataan Lambiyan",
    artist:   "Jubin Nautiyal",
    album:    "Shershaah",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Monkeys%20Spinning%20Monkeys.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/34/d3/f9/34d3f983-d616-22a2-5482-7df486a90b64/195497175277.jpg/600x600bb.jpg"
  },
  {
    title:    "Dil Diyan Gallan",
    artist:   "Atif Aslam",
    album:    "Tiger Zinda Hai",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Healing.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music112/v4/fb/0d/9c/fb0d9c55-5fcd-22af-2b0e-9f7c7cab31be/cover.jpg/600x600bb.jpg"
  },
  {
    title:    "Kuch Kuch Hota Hai",
    artist:   "Udit Narayan, Alka Yagnik",
    album:    "Kuch Kuch Hota Hai",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Carefree.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/8d/f4/aa/8df4aa7a-e022-f694-ddf7-f45a745cbe02/191773227685.jpg/600x600bb.jpg"
  },
  {
    title:    "Kesariya",
    artist:   "Pritam",
    album:    "Brahmastra",
    genre:    "Bollywood",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Monkeys%20Spinning%20Monkeys.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music126/v4/7b/22/e3/7b22e3d0-8b48-b64c-a0a2-a3cb5dac2649/0888608159302.jpg/600x600bb.jpg"
  },
  {
    title:    "Kun Faya Kun",
    artist:   "A.R. Rahman",
    album:    "Rockstar",
    genre:    "Sufi",
    audioUrl: "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Space%20Jazz.mp3",
    coverUrl: "https://is1-ssl.mzstatic.com/image/thumb/Music118/v4/bc/f8/bf/bcf8bf65-f9f6-a36c-9419-4b684cb1357c/8902894356060_cover.jpg/600x600bb.jpg"
  }
];

// ─── HTTP download helper ─────────────────────────────────────────────────────
function download(url, destPath) {
  return new Promise((resolve, reject) => {
    const proto  = url.startsWith("https") ? https : http;
    const tmpPath = destPath + ".tmp";

    function fetchUrl(currentUrl, redirectCount = 0) {
      if (redirectCount > 5) {
        return reject(new Error(`Too many redirects for ${url}`));
      }

      proto.get(currentUrl, (res) => {
        // Handle redirects
        if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
          const redirectUrl = res.headers.location;
          const newProto    = redirectUrl.startsWith("https") ? https : http;
          // swap proto binding if needed
          return newProto.get(redirectUrl, (res2) => {
            if ([301, 302, 303, 307, 308].includes(res2.statusCode) && res2.headers.location) {
              fetchUrl(res2.headers.location, redirectCount + 1);
            } else if (res2.statusCode === 200) {
              pipeToFile(res2, tmpPath, destPath, resolve, reject);
            } else {
              reject(new Error(`HTTP ${res2.statusCode} for ${redirectUrl}`));
            }
          }).on("error", reject);
        }

        if (res.statusCode === 200) {
          pipeToFile(res, tmpPath, destPath, resolve, reject);
        } else {
          reject(new Error(`HTTP ${res.statusCode} for ${currentUrl}`));
        }
      }).on("error", reject);
    }

    fetchUrl(url);
  });
}

function pipeToFile(res, tmpPath, destPath, resolve, reject) {
  const file = createWriteStream(tmpPath);
  res.pipe(file);
  file.on("finish", () => {
    file.close(async () => {
      const fileStat = await stat(tmpPath).catch(() => null);
      if (!fileStat || fileStat.size < 1000) {
        await unlink(tmpPath).catch(() => {});
        reject(new Error(`Downloaded file too small (${fileStat?.size ?? 0} bytes) — likely a 404 page`));
        return;
      }
      // atomic rename
      const { rename } = await import("fs/promises");
      await rename(tmpPath, destPath);
      resolve(destPath);
    });
  });
  file.on("error", (err) => {
    unlink(tmpPath).catch(() => {});
    reject(err);
  });
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const mongoUri = process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/wave";

  console.log(`\n🔗  Connecting to MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri);
  console.log("✅  Connected.\n");

  // Ensure seeder user exists
  const SEEDER_EMAIL = "seeder@wave.local";
  let seeder = await User.findOne({ email: SEEDER_EMAIL });
  if (!seeder) {
    seeder = await User.create({
      name:         "Wave Seeder",
      email:        SEEDER_EMAIL,
      passwordHash: crypto.createHash("sha256").update("wave-seed-not-a-real-password").digest("hex"),
      role:         "admin"
    });
    console.log(`👤  Created seeder user (${SEEDER_EMAIL})\n`);
  } else {
    console.log(`👤  Using existing seeder user (${SEEDER_EMAIL})\n`);
  }

  let seeded = 0;
  let skipped = 0;
  let failed = 0;

  for (const track of SONGS) {
    const exists = await Song.findOne({ title: track.title, artist: track.artist });
    if (exists) {
      // Check if it already has a cover. If not, and track has a coverUrl, try downloading it.
      if (!exists.coverPath && track.coverUrl) {
        process.stdout.write(`🖼️   Downloading cover for existing "${track.title}" by ${track.artist} … `);
        const coverExt  = ".jpg";
        const coverFile = `${crypto.randomUUID()}${coverExt}`;
        const coverPath = path.join(COVERS_DIR, coverFile);
        try {
          await download(track.coverUrl, coverPath);
          exists.coverPath = coverPath;
          await exists.save();
          console.log("done (updated DB)");
          seeded++;
        } catch (err) {
          console.log(`FAILED (${err.message})`);
          failed++;
        }
      } else {
        console.log(`⏭️   Skip  "${track.title}" by ${track.artist} (already in DB with cover)`);
        skipped++;
      }
      continue;
    }

    // Build dest file paths
    const audioExt  = ".mp3";
    const audioFile = `${crypto.randomUUID()}${audioExt}`;
    const audioPath = path.join(AUDIO_DIR, audioFile);

    process.stdout.write(`⬇️   Downloading "${track.title}" by ${track.artist} … `);

    try {
      await download(track.audioUrl, audioPath);
      console.log("done");
    } catch (err) {
      console.log(`FAILED (${err.message})`);
      failed++;
      continue;
    }

    // Optional cover
    let coverPath = null;
    if (track.coverUrl) {
      const coverExt  = ".jpg";
      const coverFile = `${crypto.randomUUID()}${coverExt}`;
      coverPath = path.join(COVERS_DIR, coverFile);
      try {
        await download(track.coverUrl, coverPath);
      } catch {
        coverPath = null; // cover is optional, continue without
      }
    }

    await Song.create({
      title:      track.title,
      artist:     track.artist,
      album:      track.album ?? "",
      genre:      track.genre ?? "",
      duration:   0,
      audioPath,
      coverPath,
      mimeType:   "audio/mpeg",
      uploadedBy: seeder._id,
      playCount:  0
    });

    console.log(`✅  Seeded "${track.title}" by ${track.artist}`);
    seeded++;
  }

  console.log(`\n🎵  Done! Seeded/Updated: ${seeded}  |  Skipped: ${skipped}  |  Failed: ${failed}\n`);

  if (failed > 0) {
    console.log("ℹ️   Some tracks or covers failed to download. Re-run the script to retry.\n");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌  Seed script error:", err.message);
  process.exit(1);
});
