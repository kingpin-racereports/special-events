/*
  REPORTS DATA
  ------------
  This is the only file you need to touch when a new race report goes into
  the repo. Copy an entry, fill in your own details, save, commit.

  file   – path to the report HTML file, relative to index.html
           (drop the report file into /reports/ and point to it here)
  image  – banner image for the card, relative to index.html
           (drop new photos into /images/)
  accent – optional hex color for the card's stripe/tag (defaults to the
           site's blue if left out)

  Newest report can go anywhere in the list — they're sorted by date
  automatically, most recent first.
*/

const REPORTS = [
  {
    title: "Spa 24hr presented by Falken Tire",
    track: "Circuit of Spa-Francorchamps",
    date: "2026-07-12",
    result: "P33 in class",
    summary: "The 24 Hours of Spa is an endurance race held in Belgium at Circuit de Spa-Francorchamps since 1923. It is part of the Intercontinental GT Challenge Series in the real world.",
    image: "images/spaeventjul11.png",
    file: "reports/Spa24hKingpinBlueJul11.html",
    accent: "#35b7e0"
  },
      {
    title: "6 hours of Watkins Glen",
    track: "Watkins Glen",
    date: "2026-06-20",
    result: "P2 in class",
    summary: "The 6 Hours of the Glen Powered by VCO is a 6 hour endurance race held annually at Watkins Glen International in Watkins Glen, New York. It is the third round of the IMSA Michelin Endurance Cup in the IMSA WeatherTech SportsCar Championship.",
    image: "images/watkinseventjun19.png",
    file: "reports/KinpinWatkinsJun19.html",
    accent: "#C0C0C0"
  },      
  {
    title: "Sebring 12HR",
    track: "Sebring International",
    date: "2026-03-28",
    result: "P3 in class",
    summary: "The Sebring 12HR is a 12-hour endurance race held at Sebring International Raceway in Sebring, Florida.  It is the second round of the IMSA Michelin Endurance Cup in the IMSA WeatherTech SportsCar Championship.",
    image: "images/sebring12hr.png",
    file: "reports/Sebring12hr2026.html",
    accent: "#804A00"
  },  
  {
    title: "Bathurst 12HR",
    track: "Mount Panorama Circuit",
    date: "2026-02-21",
    result: "P3 in class",
    summary: "The Bathurst 12 Hour is a 12 hour endurance race staged on the Mount Panorama Circuit in Bathurst, New South Wales, Australia. This event serves as the opening round to the Intercontinental GT Challenge Series in the real world.",
    image: "images/bathurst12hr.png",
    file: "reports/Bathurst12hr.html",
    accent: "#804A00"
  },
];
