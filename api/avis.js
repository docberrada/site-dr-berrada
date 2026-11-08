// Note et nombre d'avis de la fiche Google Maps du cabinet.
// Réglages à faire dans Vercel (Settings → Environment Variables) :
//   GOOGLE_PLACES_KEY : clé Google Maps (API « Places API (New) » uniquement)
//   GOOGLE_PLACE_ID   : identifiant de la fiche Google du cabinet
// La réponse est gardée 12 h par Vercel : Google n'est interrogé que quelques fois par jour.
module.exports = async (req, res) => {
  const key = process.env.GOOGLE_PLACES_KEY;
  const id = process.env.GOOGLE_PLACE_ID;
  if (!key || !id) {
    res.setHeader("Cache-Control", "public, s-maxage=3600");
    return res.status(503).json({ erreur: "non configuré" });
  }
  try {
    const r = await fetch("https://places.googleapis.com/v1/places/" + encodeURIComponent(id), {
      headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": "rating,userRatingCount" },
    });
    if (!r.ok) throw new Error("Google " + r.status);
    const d = await r.json();
    if (typeof d.rating !== "number" || typeof d.userRatingCount !== "number") throw new Error("réponse incomplète");
    res.setHeader("Cache-Control", "public, s-maxage=43200, stale-while-revalidate=604800");
    return res.status(200).json({ note: d.rating, avis: d.userRatingCount });
  } catch (e) {
    console.error("avis Google :", e.message);
    res.setHeader("Cache-Control", "public, s-maxage=600");
    return res.status(502).json({ erreur: "indisponible" });
  }
};
