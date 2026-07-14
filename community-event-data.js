/* ════════════════════════════════════
   COMMUNITY EVENT PLATFORM DATA
   Adapted from content/traditions/weekly_schedule.md in the public
   espil77/3rd-Space repository (concept/asset origin; see
   docs/features/community-event-platform.md for full attribution).
   This is a separate, isolated dataset — it is never merged into the
   existing `events` array in data.js, and nothing here is treated as
   Jumpstart Jax-verified. Every tradition's verificationStatus is "unverified"
   because the source schedule itself has never been independently
   checked (see that file's "Schedule verified" column, all TBD).
═══════════════════════════════════ */
(function () {
  var traditions = [
    {
      id: "riverfront-picnic",
      dayIndex: 1, // Monday (Date.getDay(): Sun=0..Sat=6)
      dayLabel: "Mon",
      title: "Riverfront Picnic",
      location: "Riverfront Plaza",
      time: "12:00pm–2:00pm",
      isAnchor: false,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space). Day, time, and place have not been independently verified by Jumpstart Jax."
    },
    {
      id: "trivia-night",
      dayIndex: 2, // Tuesday
      dayLabel: "Tue",
      title: "Trivia Night",
      location: "Spliff's Gastropub",
      time: "6:30pm–8:00pm",
      isAnchor: false,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space). Day, time, and place have not been independently verified by Jumpstart Jax."
    },
    {
      id: "volunteer-hour",
      dayIndex: 3, // Wednesday
      dayLabel: "Wed",
      title: "Volunteer Hour",
      location: "City Rescue Mission Food Pantry",
      time: "5:30pm–6:30pm",
      isAnchor: false,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space). Day, time, and place have not been independently verified by Jumpstart Jax."
    },
    {
      id: "three-dollar-thursdays",
      dayIndex: 4, // Thursday
      dayLabel: "Thu",
      title: "$3 Thursdays",
      location: "Happy Medium Cafe",
      time: "7:00am–8:30am",
      isAnchor: false,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space). Day, time, and place have not been independently verified by Jumpstart Jax."
    },
    {
      id: "intern-mixer",
      dayIndex: 5, // Friday
      dayLabel: "Fri",
      title: "Intern Mixer",
      location: "The Block",
      time: "5:00pm–7:00pm",
      isAnchor: false,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space). Day, time, and place have not been independently verified by Jumpstart Jax."
    },
    {
      id: "meetup-clothes-exchange",
      dayIndex: 6, // Saturday
      dayLabel: "Sat",
      title: "Meetup & Clothes Exchange",
      location: "Riverside Arts Market",
      time: "9:00am–12:00pm",
      isAnchor: false,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space). Day, time, and place have not been independently verified by Jumpstart Jax."
    },
    {
      id: "sunday-jazz",
      dayIndex: 0, // Sunday
      dayLabel: "Sun",
      title: "Sunday Jazz",
      location: "Casbah Cafe",
      time: "starts 9:00pm",
      isAnchor: true,
      verificationStatus: "unverified",
      sourceNote: "Adapted from content/traditions/weekly_schedule.md (espil77/3rd-Space), described there as the anchor night. Day, time, and place have not been independently verified by Jumpstart Jax."
    }
  ];

  var data = {
    title: "Community Event Platform",
    tagline: "Someone's already making plans for tonight.",
    description: "A third place is wherever isn't home and isn't work — the corner table, the regular Tuesday thing, the place where you go from a face to a name. This prototype is a bet that Jacksonville already has plenty of these, if you know where to look.",
    footer: "The website is not the destination. Jacksonville is.",
    scheduleSource: "content/traditions/weekly_schedule.md (espil77/3rd-Space), adapted",
    lastReviewedAt: "2026-07-14",
    overallVerificationStatus: "unverified",
    traditions: Object.freeze(traditions.map(Object.freeze))
  };

  window.COMMUNITY_EVENT_PLATFORM_DATA = Object.freeze(data);
})();
