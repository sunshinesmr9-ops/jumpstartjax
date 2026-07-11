/* ════════════════════════════════════
   DATA
═══════════════════════════════════ */
const employers = [
  {
    id: 1, name: "Mayo Clinic Florida", icon: "fa-solid fa-hospital", logo: "https://www.google.com/s2/favicons?domain=mayoclinic.org&sz=256",
    industry: "Healthcare", type: "Internship",
    grade: "College", paid: true,
    lat: 30.2645, lng: -81.4423,
    location: "4500 San Pablo Rd, Jacksonville, FL",
    description: "Gain hands-on clinical and research experience at one of the nation's top-ranked hospitals. Work alongside world-class physicians and scientists on meaningful projects.",
    duration: "10 weeks (late May – late July)",
    deadline: "Applications open Nov 1, close Jan 31 each year",
    internshipUrl: "https://jobs.mayoclinic.org/job/jacksonville/intern-undergraduate/33647/94597157872",
    requirements: ["GPA 3.0+", "Pre-med, biology, or related field", "U.S. citizen or permanent resident"],
    supplementals: [
      { q: "Describe a time you demonstrated empathy in a challenging situation. How did this shape your interest in healthcare? (250 words max)" },
      { q: "Which department at Mayo Clinic Florida interests you most and why? (150 words max)" }
    ],
    programs: ["Summer Research Fellowship", "Clinical Shadowing Program"]
  },
  {
    id: 2, name: "Fidelity Investments", icon: "fa-solid fa-chart-line", logo: "https://www.google.com/s2/favicons?domain=fidelity.com&sz=256",
    industry: "Finance", type: "Co-op",
    grade: "College", paid: true,
    lat: 30.2631, lng: -81.5483,
    location: "4601 Touchton Rd E, Jacksonville, FL 32246",
    description: "Join Fidelity's Jacksonville campus for a rotational co-op experience across technology, finance, and customer experience teams. Real responsibility from day one.",
    duration: "6 months (Co-op) or 10 weeks (Summer Internship)",
    deadline: "Applications open each Fall for the following summer",
    internshipUrl: "https://jobs.fidelity.com/en/students/internships/",
    requirements: ["Sophomore or Junior", "Finance, CS, or Business major", "Strong analytical skills"],
    supplementals: [
      { q: "Why are you interested in financial services, and how does this role fit your career goals? (200 words max)" }
    ],
    programs: ["Technology Co-op", "Finance Analyst Track"]
  },
  {
    id: 3, name: "JEA", icon: "fa-solid fa-bolt", logo: "https://www.google.com/s2/favicons?domain=jea.com&sz=256",
    industry: "Engineering", type: "Internship",
    grade: "Both", paid: true,
    lat: 30.3275, lng: -81.6622,
    location: "21 W Church St, Jacksonville, FL",
    description: "Jacksonville's public utility invites students to work on real infrastructure projects, from clean energy initiatives to smart grid technology and water systems.",
    duration: "Summer (length varies by role)",
    deadline: "Visit jea.com for current openings, deadlines vary",
    internshipUrl: "https://www.jea.com/about/careers/college_internships",
    requirements: ["Engineering, environmental science, or CS student", "Interest in public infrastructure"],
    supplementals: [
      { q: "How do you see the future of sustainable energy in Northeast Florida? (200 words max)" },
      { q: "Describe a project where you solved a complex technical problem. (200 words max)" }
    ],
    programs: ["Engineering Intern", "IT & Cybersecurity Intern"]
  },
  {
    id: 4, name: "City of Jacksonville", icon: "fa-solid fa-landmark", logo: "https://www.google.com/s2/favicons?domain=coj.net&sz=256",
    industry: "Government", type: "Fellowship",
    grade: "Both", paid: true,
    lat: 30.3300, lng: -81.6594,
    location: "117 W Duval St, Jacksonville, FL",
    description: "The Mayor's Civic Innovation Fellows program places students within city departments to work on policy, data, and community projects that shape Jacksonville's future.",
    duration: "Summer (8–10 weeks, varies by department)",
    deadline: "Rolling, visit jacksonville.gov for current postings",
    internshipUrl: "https://www.jacksonville.gov/departments/employee-services/current-job-openings/internship-opportunities",
    requirements: ["Interest in public policy or civic tech", "Strong writing and communication skills"],
    supplementals: [
      { q: "What is one challenge facing Jacksonville that you would want to work on during this fellowship, and how would you approach it? (300 words max)" }
    ],
    programs: ["Mayor's Civic Innovation Fellowship", "Public Works Internship"]
  },
  {
    id: 5, name: "Nemours Children's Health", icon: "fa-solid fa-heart-pulse", logo: "https://www.google.com/s2/favicons?domain=nemours.org&sz=256",
    industry: "Healthcare", type: "Job Shadow",
    grade: "High School", paid: false,
    lat: 30.3129, lng: -81.6632,
    location: "807 Children's Way, Jacksonville, FL",
    description: "Shadow pediatric healthcare professionals across specialties, from surgery to child psychology. Designed specifically for high school students exploring healthcare careers.",
    duration: "2 weeks (Winter Break / Summer)",
    deadline: "Rolling",
    internshipUrl: "https://www.nemours.org/education/research.html",
    requirements: ["11th or 12th grade", "Interest in pediatric healthcare", "Teacher recommendation"],
    supplementals: [
      { q: "Why are you interested in working with children in a healthcare setting? (150 words max)" }
    ],
    programs: ["Healthcare Explorer Program"]
  },
  {
    id: 6, name: "CSX Transportation", icon: "fa-solid fa-train", logo: "https://www.google.com/s2/favicons?domain=csx.com&sz=256",
    industry: "Engineering", type: "Internship",
    grade: "College", paid: true,
    lat: 30.3244, lng: -81.6640,
    location: "500 Water St, Jacksonville, FL",
    description: "CSX's headquarters in Jacksonville offers engineering, supply chain, IT, and finance internships with mentorship from industry leaders in freight transportation.",
    duration: "10 weeks (May – July)",
    deadline: "Applications typically open September – October each year",
    internshipUrl: "https://www.csx.com/index.cfm/working-at-csx/job-overviews/internship-programs/",
    requirements: ["Junior or Senior", "Engineering, logistics, finance, or IT major", "GPA 3.2+"],
    supplementals: [
      { q: "How does transportation infrastructure connect to economic growth? What excites you about the freight industry? (250 words max)" }
    ],
    programs: ["Engineering Internship", "Supply Chain & Logistics Intern"]
  },
  {
    id: 7, name: "VyStar Credit Union", icon: "fa-solid fa-building-columns", logo: "https://www.google.com/s2/favicons?domain=vystarcu.org&sz=256",
    industry: "Finance", type: "Internship",
    grade: "High School", paid: true,
    lat: 30.3259, lng: -81.6599,
    location: "Multiple High School Campuses, Northeast FL",
    description: "Launched in 2006, VyStar's Academy of Business High School Branch Program is an award-winning initiative that places student interns inside real, fully-operational credit union branches located directly in their high schools. Interns manage daily branch operations under the guidance of career academy instructors and VyStar program advisors, gaining hands-on experience in loans, credit cards, budgeting, investing, and customer service while earning income and academic credit. The program has provided 2,200+ paid internships and reached 160,000+ students across Northeast Florida.",
    duration: "School Year (ongoing)",
    deadline: "Apply through your school",
    internshipUrl: "https://vystarcu.wd1.myworkdayjobs.com/Careers",
    requirements: [
      "Currently enrolled at a participating high school with a Career & Technical Education (CTE) program",
      "Interest in finance, banking, or business",
      "Participating schools include: Bartram Trail, Clay, First Coast, Fleming Island, Fletcher, Mandarin, Ribault, Riverside, West Nassau, Yulee, and more"
    ],
    supplementals: [
      { q: "Why are you interested in working in financial services, and how do you think managing a real bank branch at your school would help prepare you for your future? (200 words max)" },
      { q: "VyStar's mission is to 'Do Good' for its members and community. Describe a time you demonstrated leadership or service in your school or community. (150 words max)" }
    ],
    programs: ["Academy of Business High School Branch Program"]
  },
  {
    id: 8, name: "UF Health Jacksonville", icon: "fa-solid fa-stethoscope", logo: "https://www.google.com/s2/favicons?domain=ufhealth.org&sz=256",
    industry: "Healthcare", type: "Internship",
    grade: "Both", paid: true,
    lat: 30.3470, lng: -81.6635,
    location: "655 W 8th St, Jacksonville, FL",
    description: "Florida's largest safety-net hospital offers research, clinical, administrative, and public health internships with direct community impact.",
    duration: "Summer (10–12 weeks, varies by program)",
    deadline: "Visit ufhealthjax.org/careers for current openings",
    internshipUrl: "https://ufhealthjax.org/careers",
    requirements: ["Pre-health, public health, or healthcare admin major", "Commitment to underserved communities"],
    supplementals: [
      { q: "Describe your experience with or commitment to serving diverse and underserved populations. (250 words max)" }
    ],
    programs: ["Clinical Research Intern", "Public Health Fellow"]
  },
  {
    id: 9, name: "Intercontinental Exchange (ICE)", icon: "fa-solid fa-code", logo: "https://www.google.com/s2/favicons?domain=ice.com&sz=256",
    industry: "Technology", type: "Internship",
    grade: "College", paid: true,
    lat: 30.2587, lng: -81.5488,
    location: "4800 E Deer Lake Drive, Jacksonville, FL 32246",
    description: "ICE (formerly Black Knight) is a Fortune 500 fintech company headquartered in Jacksonville powering global financial markets, mortgage technology, and data services. Interns work on software engineering, data analytics, business analysis, and partner success, with projects that impact millions of financial transactions worldwide.",
    duration: "10–11 weeks (Summer)",
    deadline: "Rolling, check careers.ice.com for current openings",
    internshipUrl: "https://www.ice.com/careers/intern",
    requirements: ["Penultimate or final year university student", "CS, software engineering, finance, or business major", "Strong analytical and communication skills"],
    supplementals: [
      { q: "Describe a software project you've built or contributed to. What was your role and what did you learn? (250 words max)" },
      { q: "How do you see AI transforming the financial technology industry? (200 words max)" }
    ],
    programs: ["Software Engineering Intern", "Data Analytics Intern", "Business Analyst Intern", "Partner Success Intern"]
  },
  {
    id: 10, name: "JAXPORT", icon: "fa-solid fa-ship", logo: "https://www.google.com/s2/favicons?domain=jaxport.com&sz=256",
    industry: "Logistics", type: "Internship",
    grade: "College", paid: true,
    lat: 30.3355, lng: -81.6335,
    location: "2831 Talleyrand Ave, Jacksonville, FL",
    description: "Jacksonville's seaport, one of the fastest growing in the U.S., offers paid internships in Sales & Marketing, Communications, Public Safety, and more. Junior, senior, and graduate students with a GPA of 2.5+ are eligible.",
    duration: "Summer",
    deadline: "Check website for current openings",
    internshipUrl: "https://www.jaxport.com/corporate/community/education",
    requirements: ["Junior, Senior, or Graduate student", "GPA 2.5+", "Business, logistics, communications, or related major"],
    supplementals: [
      { q: "How does international trade impact the Jacksonville economy and local communities? (200 words max)" }
    ],
    programs: ["Port Operations Intern", "Trade & Logistics Intern"]
  },
  {
    id: 13, name: "Miller Electric Company", icon: "fa-solid fa-plug", logo: "https://www.google.com/s2/favicons?domain=mecojax.com&sz=256",
    industry: "Engineering", industryLabel: "Engineering/Construction", type: "Internship",
    grade: "College", paid: true,
    lat: 30.2592, lng: -81.5910,
    location: "6805 Southpoint Pkwy, Jacksonville, FL 32216",
    description: "Miller Electric Company, one of Jacksonville's largest and most respected electrical contractors, offers paid summer internships across nearly every area of the business. Interns are immersed in real construction projects, mentored by experienced professionals, and given meaningful responsibility from day one. The program is designed for motivated college students who want hands-on experience in the construction and engineering industry. Miller Electric is a subsidiary of EMCOR Group, a Fortune 500 company, giving interns access to a national network of professionals and career pathways.",
    duration: "12 weeks (Summer)",
    deadline: "Applications typically open in Spring, check mecojax.com",
    requirements: [
      "Currently enrolled college student in a relevant field",
      "Fields of study include: Construction Management, Engineering, Accounting, IT, Marketing, HR, and more",
      "Strong work ethic and interest in the construction industry"
    ],
    supplementals: [
      { q: "Which internship area at Miller Electric interests you most (e.g., Construction Management, Engineering, IT, Accounting) and why? How does it connect to your academic or career goals? (250 words max)" },
      { q: "Describe a time you worked as part of a team to complete a project or solve a problem. What was your role and what did you learn? (200 words max)" }
    ],
    programs: ["Construction Management Internship", "Engineering Internship", "IT Internship", "Accounting Internship", "Marketing Internship", "Virtual Design & Construction Internship"],
    internshipUrl: "https://mecojax.com/join-the-team/internships"
  },
  {
    id: 14, name: "Jacksonville Transportation Authority (JTA)", icon: "fa-solid fa-bus", logo: "https://www.google.com/s2/favicons?domain=jtafla.com&sz=256",
    industry: "Government", type: "Internship",
    grade: "College", paid: true,
    lat: 30.3291, lng: -81.6725,
    location: "100 LaVilla Center Drive, Jacksonville, FL 32204",
    description: "JTA's 10-week summer internship places students inside the teams driving Jacksonville's transit transformation, from the autonomous Skyway to BRT and micro-mobility. Divisions include Finance, Marketing, Transportation Planning, Human Resources, and Public Affairs.",
    duration: "10 weeks (Summer)",
    deadline: "Applications typically open February – March each year",
    internshipUrl: "https://www.jtafla.com/contact-us/careers/summer-internship/",
    requirements: ["Enrolled in trade school, undergraduate, or graduate program", "Interest in public transportation and urban mobility"],
    programs: ["Transportation Planning Intern", "Finance & Administration Intern", "Public Affairs Intern"]
  },
  {
    id: 15, name: "Jacksonville Aviation Authority (JAA)", icon: "fa-solid fa-plane", logo: "https://www.google.com/s2/favicons?domain=flyjacksonville.com&sz=256",
    industry: "Government", type: "Internship",
    grade: "College", paid: true,
    lat: 30.4916, lng: -81.6842,
    location: "14201 Pecan Park Rd, Jacksonville, FL 32218 (Jacksonville International Airport)",
    description: "The Jacksonville Aviation Authority operates Jacksonville International Airport and three general aviation airports. Interns spend 8 weeks embedded in airport operations, marketing, facilities, or public affairs, rare access to a major U.S. airport from the inside.",
    duration: "8 weeks (Summer)",
    deadline: "Check flyjacksonville.com for current openings",
    internshipUrl: "https://www.flyjacksonville.com/jaa/content.aspx?id=79",
    requirements: ["College student in marketing, airport operations, aviation management, or related field", "Interest in aviation and public infrastructure"],
    programs: ["Airport Operations Intern", "Marketing & Communications Intern", "Facilities Management Intern"]
  },
  {
    id: 16, name: "Jacksonville Urban League", icon: "fa-solid fa-handshake", logo: "https://www.google.com/s2/favicons?domain=ul-jacksonville.iamempowered.com&sz=256",
    industry: "Nonprofit", type: "Internship",
    grade: "Both", paid: true,
    lat: 30.3332, lng: -81.6671,
    location: "903 W. Union St., Jacksonville, FL 32202",
    description: "The Jacksonville Urban League's Youth Employment Services (YES) Program connects young people ages 16–21 with six weeks of paid summer internships placed across nonprofit and for-profit organizations throughout Jacksonville. The program includes career coaching, professional development workshops, and job placement support.",
    duration: "6 weeks (Summer)",
    deadline: "Applications open each Spring, check ul-jacksonville.iamempowered.com",
    internshipUrl: "https://ul-jacksonville.iamempowered.com/employment-and-training",
    requirements: ["Ages 16–21", "Duval County resident", "Interest in career readiness and workforce development"],
    programs: ["Youth Employment Services (YES) Program", "Summer Youth Internship Placement"]
  },
  {
    id: 17, name: "Goodwill of North Florida", icon: "fa-solid fa-seedling", logo: "https://www.google.com/s2/favicons?domain=goodwillnorthfl.org&sz=256",
    industry: "Nonprofit", type: "Internship",
    grade: "Both", paid: true,
    lat: 30.2471, lng: -81.7234,
    location: "5150 Timuquana Rd, Suite 15, Jacksonville, FL 32210",
    description: "Through the Mayor's Youth at Work Partnership (MYAWP), Goodwill of North Florida places eligible youth in paid internships and work experiences across Jacksonville employers, building a talent pipeline while giving young people their first foothold in a professional environment.",
    duration: "Summer (6–8 weeks)",
    deadline: "Applications typically open April – May each year",
    internshipUrl: "https://goodwillnorthfl.org/mayors-youth-at-work-partnership-myawp/",
    requirements: ["Eligible youth (see website for age/income criteria)", "Duval County resident", "Interest in building career and professional skills"],
    programs: ["Mayor's Youth at Work Partnership (MYAWP)"]
  },
  {
    id: 18, name: "Jacksonville Youth Works", icon: "fa-solid fa-people-group", logo: "https://www.google.com/s2/favicons?domain=jaxyouthworks.org&sz=256",
    industry: "Nonprofit", type: "Internship",
    grade: "Both", paid: true,
    lat: 30.3569, lng: -81.6590,
    location: "303 E 21st St, Jacksonville, FL 32206",
    description: "Jacksonville Youth Works is a 501(c)(3) dedicated to empowering youth ages 14–25 in Jacksonville's underserved neighborhoods through workforce training, mentorship, and community revitalization. Programs combine professional skill-building with hands-on work experience and wrap-around support.",
    duration: "Varies by program",
    deadline: "Rolling, visit jaxyouthworks.org",
    internshipUrl: "https://www.jaxyouthworks.org/",
    requirements: ["Ages 14–25", "Jacksonville resident", "Interest in career development and community impact"],
    programs: ["Workforce Training Program", "Youth Internship Placement", "Community Apprenticeship"]
  },
  {
    id: 19, name: "Fanatics", icon: "fa-solid fa-shirt", logo: "https://www.google.com/s2/favicons?domain=fanaticsinc.com&sz=256",
    industry: "Technology", type: "Internship",
    grade: "College", paid: true,
    lat: 30.2402, lng: -81.5928,
    location: "8100 Nations Way, Jacksonville, FL 32256",
    description: "Fanatics is a global sports platform and one of Jacksonville's largest tech employers, with internships in software engineering, data analytics, merchandising, marketing, and supply chain. Interns gain exposure to the full ecosystem of a fast-growing sports commerce company impacting leagues, athletes, and fans worldwide.",
    duration: "10 weeks (Summer)",
    deadline: "Applications open each Fall, check fanaticsinc.com/join-our-team",
    internshipUrl: "https://www.fanaticsinc.com/join-our-team",
    requirements: ["College junior or senior (graduating Dec 2026 or Spring/Summer 2027)", "GPA 3.3+", "CS, Business, Marketing, Supply Chain, or related major"],
    programs: ["Software Engineering Intern", "Data Analytics Intern", "Merchandising Intern", "Supply Chain Intern"]
  },
  {
    id: 20, name: "Crowley Maritime", icon: "fa-solid fa-anchor", logo: "https://www.google.com/s2/favicons?domain=crowley.com&sz=256",
    industry: "Logistics", type: "Internship",
    grade: "College", paid: true,
    lat: 30.3284, lng: -81.5500,
    location: "9487 Regency Square Blvd, Jacksonville, FL 32225",
    description: "Crowley is a privately held logistics and maritime services company headquartered in Jacksonville, operating across the Americas. Interns join teams that move goods by sea and land across the Western Hemisphere, with opportunities in logistics operations, engineering, finance, and marketing.",
    duration: "Summer (10–12 weeks)",
    deadline: "Applications typically open in Spring, check crowley.com",
    internshipUrl: "https://www.crowley.com/crowley-for-students/",
    requirements: ["Junior or Senior in a degree-seeking program", "Logistics, supply chain, engineering, finance, or marketing major"],
    programs: ["Logistics & Supply Chain Intern", "Engineering Intern", "Finance Intern"]
  },
  {
    id: 21, name: "Baptist Health Jacksonville", icon: "fa-solid fa-hospital-user", logo: "https://www.google.com/s2/favicons?domain=baptistjax.com&sz=256",
    industry: "Healthcare", type: "Internship",
    grade: "College", paid: true,
    lat: 30.3156, lng: -81.6633,
    location: "800 Prudential Dr, Jacksonville, FL 32207",
    description: "Northeast Florida's largest private healthcare system offers clinical internships and the Allied Health Scholars Program, work-integrated learning for students in allied health disciplines including CT imaging, respiratory therapy, phlebotomy, and medical assisting, with financial incentives and hands-on clinical rotation experience.",
    duration: "Varies by program (4 months to 1 year)",
    deadline: "Rolling, visit baptistjax.com/about-us/careers",
    internshipUrl: "https://www.baptistjax.com/about-us/careers",
    requirements: ["College student in healthcare, allied health, or related field", "Program-specific clinical prerequisites may apply"],
    programs: ["Allied Health Scholars Program", "CT Technologist Internship", "Clinical Rotation Program"]
  },
  {
    id: 22, name: "WJCT Public Media", icon: "fa-solid fa-radio", logo: "https://www.google.com/s2/favicons?domain=wjct.org&sz=256",
    industry: "Media", type: "Internship",
    grade: "Both", paid: false,
    lat: 30.3199, lng: -81.6368,
    location: "100 Festival Park Ave, Jacksonville, FL 32202",
    description: "WJCT is Northeast Florida's NPR and PBS affiliate. Interns work alongside professional journalists and producers in a real broadcast environment, creating content for radio, television, and digital platforms that reaches hundreds of thousands of listeners and viewers across the region.",
    duration: "Semester-based (part-time, flexible)",
    deadline: "Rolling, visit wjct.org for current openings",
    internshipUrl: "https://wjct.org/employment/2022/07/internships-at-wjct-public-media/",
    requirements: ["Interest in journalism, media production, communications, or community engagement", "Ability to commit to broadcast schedule hours"],
    programs: ["Broadcast Journalism Intern", "Radio Production Intern", "Digital Media & Content Intern"]
  },
  {
    id: 23, name: "Jacksonville Jaguars", icon: "fa-solid fa-football", logo: "https://www.google.com/s2/favicons?domain=jaguars.com&sz=256",
    industry: "Media", type: "Internship",
    grade: "College", paid: false,
    lat: 30.3238, lng: -81.6373,
    location: "EverBank Stadium, 1 EverBank Stadium Drive, Jacksonville, FL",
    description: "The Jacksonville Jaguars offer internships across Guest Experience, Marketing, Operations, and Community Relations, hands-on experience inside a professional NFL franchise. Interns work game days and organizational events, building skills in sports business, fan engagement, and event management.",
    duration: "Season-based or semester (varies)",
    deadline: "Applications typically open Summer – Fall each year",
    internshipUrl: "https://www.jaguars.com/careers",
    requirements: ["College student aged 18+", "Currently enrolled or graduated within the last year", "Available for game days and special events"],
    programs: ["Guest Experience Intern", "Marketing Intern", "Community Relations Intern", "Operations Intern"]
  },
  {
    id: 24, name: "HabiJax (Habitat for Humanity Jacksonville)", icon: "fa-solid fa-house-chimney", logo: "https://www.google.com/s2/favicons?domain=habijax.org&sz=256",
    industry: "Nonprofit", type: "Volunteer",
    grade: "Both", paid: false,
    lat: 30.3417, lng: -81.6423,
    location: "2404 Hubbard St, Jacksonville, FL 32206",
    description: "HabiJax builds safe, affordable homes for Jacksonville families in need. Volunteers join active build sites or the ReStore, no construction experience required, training and supervision provided on-site.",
    duration: "Ongoing, flexible single days or recurring shifts",
    deadline: "Rolling, sign up for build days anytime",
    internshipUrl: "https://www.habijax.org/volunteer/",
    requirements: ["Ages 16+ (minors need a signed waiver)", "No experience necessary", "Closed-toe shoes required on build sites"],
    programs: ["Home Build Volunteer", "ReStore Volunteer"]
  },
  {
    id: 25, name: "Feeding Northeast Florida", icon: "fa-solid fa-box-open", logo: "https://www.google.com/s2/favicons?domain=feedingnefl.org&sz=256",
    industry: "Nonprofit", type: "Volunteer",
    grade: "Both", paid: false,
    lat: 30.3345, lng: -81.6472,
    location: "1502 Jessie St, Jacksonville, FL 32206",
    description: "Northeast Florida's largest food bank distributes millions of pounds of food a year. Volunteers sort and pack donations, assemble food boxes, and support mobile pantry distributions across the region.",
    duration: "Shifts as short as 2 hours, year-round",
    deadline: "Rolling, sign up for warehouse shifts online",
    internshipUrl: "https://feedingnefl.org/get-involved/volunteer/",
    requirements: ["Ages 10+ with an adult, 14+ independently", "Closed-toe shoes required", "Group and individual slots available"],
    programs: ["Warehouse Sorting Volunteer", "Mobile Pantry Volunteer"]
  },
  {
    id: 26, name: "Jacksonville Humane Society", icon: "fa-solid fa-paw", logo: "https://www.google.com/s2/favicons?domain=jaxhumane.org&sz=256",
    industry: "Nonprofit", type: "Volunteer",
    grade: "Both", paid: false,
    lat: 30.2949, lng: -81.5386,
    location: "8464 Beach Blvd, Jacksonville, FL 32216",
    description: "One of Florida's leading animal welfare organizations. Volunteers help with animal socialization, adoption events, shelter enrichment, and administrative support at the shelter.",
    duration: "Ongoing, weekly shift commitment preferred",
    deadline: "Rolling, orientation sessions held monthly",
    internshipUrl: "https://www.jaxhumane.org/volunteer/",
    requirements: ["Ages 14+ (14–15 with a parent volunteering alongside)", "Orientation session required", "Comfort working around animals"],
    programs: ["Animal Care Volunteer", "Adoption Events Volunteer"]
  },
  {
    id: 27, name: "Electrical Training Alliance of Jacksonville (ETAJ)", icon: "fa-solid fa-bolt-lightning", logo: "https://www.google.com/s2/favicons?domain=etajax.org&sz=256",
    industry: "Engineering", type: "Apprenticeship",
    grade: "College", paid: true,
    lat: 30.2823, lng: -81.6470,
    location: "Jacksonville, FL",
    description: "A registered, union-affiliated electrical apprenticeship run with IBEW Local 177 and NECA. Apprentices are placed with a member contractor and \"earn while they learn\", four years of paid on-the-job training paired with classroom instruction, leading to a journeyworker credential.",
    duration: "4 years (on-the-job training + 2 nights/week classes)",
    deadline: "Rolling, applications accepted year-round",
    internshipUrl: "https://www.etajax.org/",
    requirements: ["18 years or older", "High school diploma or GED with one algebra credit", "Valid driver's license"],
    programs: ["Registered Electrical Apprenticeship"]
  },
  {
    id: 28, name: "State Attorney's Office, 4th Judicial Circuit", icon: "fa-solid fa-gavel", logo: "https://www.google.com/s2/favicons?domain=sao4th.com&sz=256",
    industry: "Government", type: "Internship",
    grade: "College", paid: false,
    lat: 30.3283, lng: -81.6577,
    location: "311 W Monroe St, Jacksonville, FL 32202",
    description: "The State Attorney's Office offers summer internships for college and law students, exposing interns to a variety of prosecutorial experiences alongside assistant state attorneys.",
    duration: "6-8 weeks (Summer)",
    deadline: "Applications open Dec 1, close Feb 15",
    internshipUrl: "https://sao4th.com/careers/internship-program/",
    requirements: ["Completed first year of college", "Minimum 25 hours/week for 6 weeks (college) or 8 weeks (law students)", "Complete application emailed to SAO4th@coj.net"],
    programs: ["Prosecutorial Internship"]
  },
  {
    id: 29, name: "Jacksonville Zoo and Gardens", icon: "fa-solid fa-paw", logo: "https://www.google.com/s2/favicons?domain=jacksonvillezoo.org&sz=256",
    industry: "Nonprofit", type: "Volunteer",
    grade: "Both", paid: false,
    lat: 30.3958, lng: -81.6198,
    location: "370 Zoo Parkway, Jacksonville, FL 32218",
    description: "Northeast Florida's most-visited attraction relies on volunteers as Interpretive Hosts and behind-the-scenes helpers. Teach visitors about the animals, support events and exhibits, or help with office and education programs.",
    duration: "Ongoing, weekly shift commitment preferred",
    deadline: "Rolling, orientation sessions held regularly",
    internshipUrl: "https://www.jacksonvillezoo.org/support/volunteer/",
    requirements: ["Ages vary by role (teens and adults)", "ZooTeens! applications open Nov 1 and close Nov 25 each year", "Orientation and training required", "Comfort speaking with the public"],
    programs: ["ZooTeens! (year-round teen volunteer program)", "Interpretive Host Volunteer", "Special Events Volunteer"]
  },
  {
    id: 30, name: "MOSH (Museum of Science &amp; History)", icon: "fa-solid fa-flask", logo: "https://www.google.com/s2/favicons?domain=themosh.org&sz=256",
    industry: "Nonprofit", type: "Volunteer",
    grade: "Both", paid: false,
    lat: 30.3186, lng: -81.6636,
    location: "1025 Museum Cir, Jacksonville, FL 32207",
    description: "MOSH's Southbank museum welcomes volunteers to staff exhibits, assist with planetarium shows, and support school-group visits and community science events.",
    duration: "Ongoing, flexible shifts",
    deadline: "Rolling",
    internshipUrl: "https://themosh.org/about/volunteer/",
    requirements: ["Ages 16+", "Volunteer orientation required", "Interest in science education"],
    programs: ["Exhibit Floor Volunteer", "Planetarium Volunteer"]
  },
  {
    id: 31, name: "JEA Skilled Craft Apprenticeship", icon: "fa-solid fa-bolt", logo: "https://www.google.com/s2/favicons?domain=jea.com&sz=256",
    industry: "Engineering", industryLabel: "Engineering/Utilities", type: "Apprenticeship",
    grade: "College", paid: true,
    lat: 30.3275, lng: -81.6622,
    location: "21 W Church St, Jacksonville, FL",
    description: "JEA's registered apprenticeships train Meter Specialist Trainees, Substation Technicians, and other skilled-craft roles that keep Jacksonville's public utility running. Apprentices enter a written agreement with JEA and the State of Florida to complete classroom and on-the-job training.",
    duration: "Multi-year (varies by craft track)",
    deadline: "Rolling, check jea.com/careers for current openings",
    internshipUrl: "https://www.jea.com/about/careers/skilled_craft_apprenticeships/",
    requirements: ["High school diploma or GED", "Willingness to complete a physical agilities test for some roles", "Enters a formal apprenticeship agreement with JEA and the State of Florida"],
    programs: ["Meter Specialist Trainee", "Substation Technician Apprentice"]
  },
  {
    id: 32, name: "Northeast Florida Builders Association Apprenticeship", icon: "fa-solid fa-helmet-safety", logo: "https://www.google.com/s2/favicons?domain=nefba.com&sz=256",
    industry: "Engineering", industryLabel: "Engineering/Construction", type: "Apprenticeship",
    grade: "College", paid: true,
    lat: 30.2967, lng: -81.6394,
    location: "2665 Riverside Ave, Jacksonville, FL 32205",
    description: "NEFBA's registered construction apprenticeship places students with member homebuilders and contractors across Northeast Florida, pairing paid on-the-job training with classroom instruction in the building trades.",
    duration: "1-4 years depending on trade",
    deadline: "Rolling, applications accepted year-round",
    internshipUrl: "https://www.nefba.com/",
    requirements: ["18 years or older", "High school diploma or GED", "Interest in residential construction trades"],
    programs: ["Residential Construction Apprenticeship"]
  },
  {
    id: 33, name: "UNF Florida Data Science for Social Good (FL-DSSG)", icon: "fa-solid fa-chart-simple", logo: "https://www.google.com/s2/favicons?domain=unf.edu&sz=256",
    industry: "Technology", type: "Internship",
    grade: "College", paid: true,
    lat: 30.2697, lng: -81.5060,
    location: "University of North Florida, 1 UNF Drive, Jacksonville, FL 32224",
    description: "An intensive eleven-week summer internship where undergraduate and graduate students work in multi-disciplinary teams with mentors on real data science projects for community clients. Modeled on the DSSG programs in Chicago and Washington.",
    duration: "11 weeks (May 18 \u2013 Aug 7)",
    deadline: "Applications due Mar 20, 5 PM",
    internshipUrl: "https://dssg.unf.edu/dssgfellow.html",
    requirements: ["Undergraduate or graduate student", "Interest in data science for social good", "In-person at UNF campus"],
    programs: ["FL-DSSG Summer Internship"]
  },
  {
    id: 34, name: "The Haskell Company", icon: "fa-solid fa-compass-drafting", logo: "https://www.google.com/s2/favicons?domain=haskell.com&sz=256",
    industry: "Engineering", industryLabel: "Engineering/Construction", type: "Internship",
    grade: "College", paid: true,
    lat: 30.3220, lng: -81.6690,
    location: "111 Riverside Ave, Jacksonville, FL 32202",
    description: "One of the nation's leading design-build firms, headquartered on the Jacksonville riverfront. Interns in construction management, engineering, and architecture work on active project teams, analyzing bids, managing schedules, and visiting job sites.",
    duration: "Summer (10\u201312 weeks)",
    deadline: "Rolling, check haskell.com/careers for current openings",
    internshipUrl: "https://www.haskell.com/careers/",
    requirements: ["Enrolled in construction management, engineering, architecture, or related program", "Interest in design-build project delivery"],
    programs: ["Construction & Engineering Internship"]
  },
  {
    id: 35, name: "RF-SMART", icon: "fa-solid fa-barcode", logo: "https://www.google.com/s2/favicons?domain=rfsmart.com&sz=256",
    industry: "Technology", type: "Internship",
    grade: "College", paid: true,
    lat: 30.2410, lng: -81.5540,
    location: "Jacksonville, FL (US East Office)",
    description: "A Jacksonville-headquartered supply chain software company offering summer and fall internships in product strategy, software development, and business operations at its US East office.",
    duration: "Summer or Fall semester",
    deadline: "Rolling, check rfsmart.com/careers for current openings",
    internshipUrl: "https://www.rfsmart.com/careers",
    requirements: ["Currently enrolled college student", "Interest in supply chain technology or product strategy"],
    programs: ["Product Strategy Internship", "Summer Internship Program"]
  },
  {
    id: 36, name: "St. Johns Riverkeeper", icon: "fa-solid fa-water", logo: "https://www.google.com/s2/favicons?domain=stjohnsriverkeeper.org&sz=256",
    industry: "Nonprofit", type: "Volunteer",
    grade: "Both", paid: false,
    lat: 30.3540, lng: -81.6030,
    location: "2800 University Blvd N, Jacksonville, FL 32211",
    description: "The independent voice for the St. Johns River. Volunteers join river cleanups, educational outreach, water quality monitoring, and advocacy campaigns protecting Jacksonville's defining waterway.",
    duration: "Ongoing, event-based and recurring roles",
    deadline: "Rolling, sign up for cleanups anytime",
    internshipUrl: "https://www.stjohnsriverkeeper.org/",
    requirements: ["All ages welcome (minors with an adult)", "Interest in conservation and the St. Johns River"],
    programs: ["River Cleanup Volunteer", "Education & Outreach Volunteer"]
  },
  {
    id: 37, name: "Big Brothers Big Sisters of Northeast Florida", icon: "fa-solid fa-children", logo: "https://www.google.com/s2/favicons?domain=bbbsnefl.org&sz=256",
    industry: "Nonprofit", type: "Volunteer",
    grade: "College", paid: false,
    lat: 30.3290, lng: -81.6570,
    location: "Downtown Jacksonville, FL",
    description: "Mentor a local youth one-to-one through community-based or school-based programs. A few hours a month positively affects one child, and by extension the whole community.",
    duration: "Ongoing, 1-year minimum commitment preferred",
    deadline: "Rolling, enrollment year-round",
    internshipUrl: "https://www.bbbsnefl.org/",
    requirements: ["18 years or older", "Background check required", "Consistent monthly time commitment"],
    programs: ["Community-Based Mentoring", "School-Based Mentoring"]
  }
];

const industryColor = {
  Healthcare: '#D32F2F', Finance: '#2E7D32', Engineering: '#E65100',
  Government: '#1565C0', Nonprofit: '#6A1B9A', Technology: '#0277BD',
  Logistics: '#00838F', Media: '#558B2F'
};

function empIcon(iconClass, industry, size) {
  const color = industryColor[industry] || '#0D2F6B';
  const fs = size || '1.3rem';
  return `<span class="emp-icon-wrap"><i class="${iconClass}" style="color:${color};font-size:${fs}"></i></span>`;
}

function empLogo(e, imgSize, iconSize) {
  const iSize = imgSize || '40px';
  const color = industryColor[e.industry] || '#0D2F6B';
  const fs = iconSize || '1.3rem';
  if (!e.logo) return empIcon(e.icon, e.industry, fs);
  return `
    <img src="${e.logo}" alt="${e.name} logo"
      style="width:${iSize};height:${iSize};object-fit:contain;display:block;border-radius:4px;"
      onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
    <span class="emp-icon-wrap" style="display:none;"
      <i class="${e.icon}" style="color:${color};font-size:${fs}"></i>
    </span>`;
}

/* ════════════════════════════════════
   EXPERIENCEJAX DATA
═══════════════════════════════════ */
const events = [
  {
    id: 1,
    title: "Freedom Fest, America's 250th Anniversary",
    categories: ["Arts & Culture", "Outdoors"],
    date: "July 3–4, 2026 | Starts 4 PM",
    location: "Riverfront Plaza & Friendship Fountain, Downtown Jacksonville",
    price: "Free",
    free: true,
    icon: "fa-solid fa-flag-usa",
    color: "#B71C1C",
    description: "Jacksonville celebrates America's 250th birthday with two nights of live music, performances, and fireworks along the St. Johns River. Riverfront Plaza lights up July 3rd starting at 4 PM, and Friendship Fountain hosts festivities July 4th from 5:30–10 PM with the fireworks finale over the water.",
    link: "https://www.jacksonville.gov/welcome/featured-news/city-to-celebrate-america%E2%80%99s-250th-anniversary-on-july-3-and-4,-2026",
    recurring: false
  },
  {
    id: 2,
    title: "First Wednesday Art Walk",
    categories: ["Arts & Culture", "Food & Market"],
    date: "First Wednesday of each month, 5–9 PM | Next: Aug 5",
    location: "James Weldon Johnson Park & Downtown Corridors, Jacksonville",
    price: "Free",
    free: true,
    icon: "fa-solid fa-paintbrush",
    color: "#6A1B9A",
    description: "Downtown Vision's monthly Art Walk transforms the urban core into an open-air gallery. Galleries, studios, pop-up installations, live music, and local vendors fill Laura and Duval Street corridors every first Wednesday. One of Jacksonville's most beloved free events.",
    link: "https://www.visitjacksonville.com/events/downtown-first-wednesday-art-walk/",
    recurring: true
  },
  {
    id: 3,
    title: "Cummer Museum, Free First Saturday",
    categories: ["Arts & Culture"],
    date: "First Saturday of each month, 11 AM–4 PM | Next: Aug 1",
    location: "829 Riverside Ave, Jacksonville",
    price: "Free",
    free: true,
    icon: "fa-solid fa-landmark",
    color: "#1565C0",
    description: "One of the Southeast's finest art museums offers free admission on the first Saturday of every month. Explore European masterworks, American paintings, and stunning riverside gardens along the St. Johns River. College students with valid ID also receive free admission Tuesday–Friday year-round.",
    link: "https://www.cummermuseum.org",
    recurring: true
  },
  {
    id: 4,
    title: "Cummer Museum, Free Third Tuesday Evening",
    categories: ["Arts & Culture"],
    date: "Third Tuesday of each month, 4–9 PM | Next: Jul 15",
    location: "829 Riverside Ave, Jacksonville",
    price: "Free",
    free: true,
    icon: "fa-solid fa-moon",
    color: "#283593",
    description: "The Cummer Museum opens for free every third Tuesday evening, perfect for interns who can't make weekend visits. Wander the galleries and the beautiful riverside gardens along the St. Johns River after work.",
    link: "https://www.cummermuseum.org",
    recurring: true
  },
  {
    id: 5,
    title: "Jacksonville Jumbo Shrimp Baseball",
    categories: ["Sports", "Outdoors"],
    date: "Multiple dates through September | Next home games: Jul 7–11",
    location: "121 Financial Ballpark, 301 A. Philip Randolph Blvd, Downtown",
    price: "From $10",
    free: false,
    icon: "fa-solid fa-baseball",
    color: "#E65100",
    description: "Catch a Double-A baseball game at 121 Financial Ballpark right in downtown Jacksonville. The Jumbo Shrimp are the Miami Marlins' affiliate, affordable tickets, great food, and fireworks on select nights. Check the full July–September schedule at milb.com/jacksonville.",
    link: "https://www.milb.com/jacksonville/schedule",
    recurring: true
  },
  {
    id: 6,
    title: "Riverside Arts Market",
    categories: ["Food & Market", "Arts & Culture", "Outdoors"],
    date: "Every Saturday, 10 AM–3 PM | July dates: 5, 12, 19, 26",
    location: "715 Riverside Ave (Under the Fuller Warren Bridge)",
    price: "Free",
    free: true,
    icon: "fa-solid fa-tent",
    color: "#00695C",
    description: "A beloved Saturday institution under the Fuller Warren Bridge drawing 4,000+ visitors weekly. Features 150+ local makers, live music, fresh food, and handmade goods in one of Jacksonville's most vibrant neighborhoods, Riverside/Avondale. Starts with 9 AM yoga on the lawn.",
    link: "https://riversideartsmarket.org/",
    recurring: true
  },
  {
    id: 7,
    title: "Cody Johnson Live '26",
    categories: ["Arts & Culture"],
    date: "July 24–25, 2026 | 7:30 PM",
    location: "VyStar Veterans Memorial Arena, 300 A. Philip Randolph Blvd",
    price: "Tickets from $35",
    free: false,
    icon: "fa-solid fa-music",
    color: "#F57F17",
    description: "Country music star Cody Johnson brings his Live '26 tour to VyStar Veterans Memorial Arena for two nights. One of the summer's biggest concert events in Jacksonville, grab tickets early.",
    link: "https://www.ticketmaster.com/discover/jacksonville",
    recurring: false
  },
  {
    id: 8,
    title: "Hemming Park Food Truck Thursdays",
    categories: ["Food & Market", "Outdoors"],
    date: "Every Thursday, 11 AM–2 PM",
    location: "Hemming Park, 117 W Duval St, Downtown Jacksonville",
    price: "Free entry",
    free: true,
    icon: "fa-solid fa-truck",
    color: "#E65100",
    description: "Jacksonville's oldest public park in the heart of downtown hosts a weekly lunchtime food truck gathering. Perfect for interns working downtown who want a great lunch and some fresh air. Dozens of trucks rotate each week with cuisines from around the world.",
    link: "https://www.hemmingpark.org",
    recurring: true
  },
  {
    id: 9,
    title: "Kayaking on the St. Johns River",
    categories: ["Outdoors"],
    date: "Year-round | Dawn to Dusk",
    location: "Multiple launch points along the St. Johns River",
    price: "From $25 rental",
    free: false,
    icon: "fa-solid fa-person-swimming",
    color: "#0277BD",
    description: "Paddle one of the few north-flowing rivers in the US, the St. Johns River cuts through the heart of Jacksonville. Rentals available at multiple outfitters, with routes ranging from beginner-friendly urban paddles to wildlife-rich backcountry excursions. Manatees and dolphins are common sightings.",
    link: "https://www.visitjacksonville.com/things-to-do/outdoor-adventures/",
    recurring: true
  },
  {
    id: 10,
    title: "Jacksonville Beach",
    categories: ["Outdoors"],
    date: "Year-round | Open daily",
    location: "Jacksonville Beach Boardwalk (30 min from downtown)",
    price: "Free",
    free: true,
    icon: "fa-solid fa-umbrella-beach",
    color: "#0288D1",
    description: "One of Florida's most accessible Atlantic beaches is just 30 minutes from downtown. The boardwalk, fishing pier, volleyball courts, and local restaurants make Jax Beach a go-to for interns on weekends. Parking is free in most areas along the beachfront.",
    link: "https://www.jacksonvillebeach.org",
    recurring: true
  },
  {
    id: 11,
    title: "Timucuan Ecological & Historic Preserve",
    categories: ["Outdoors"],
    date: "Year-round | Dawn to Dusk",
    location: "Fort Caroline & Theodore Roosevelt Area, Jacksonville",
    price: "Free",
    free: true,
    icon: "fa-solid fa-tree",
    color: "#33691E",
    description: "Jacksonville is home to a National Park! The Timucuan Preserve protects over 46,000 acres of wetlands, marsh, and tidal forest. Fort Caroline and the Theodore Roosevelt Area offer free hiking trails, kayak launches, wildlife watching, and a window into Florida's 500-year colonial history.",
    link: "https://www.nps.gov/timu",
    recurring: true
  },
  {
    id: 12,
    title: "Arts Market of St. Augustine",
    categories: ["Arts & Culture", "Food & Market"],
    date: "1st Saturday of each month, 8:30 AM–12:30 PM | Next: Aug 1",
    location: "St. Augustine Amphitheatre (45 min from Jacksonville)",
    price: "Free",
    free: true,
    icon: "fa-solid fa-store",
    color: "#AD1457",
    description: "One of Florida's top juried fine art markets takes place just down the road in historic St. Augustine. Featuring 150+ local artists across painting, sculpture, jewelry, and photography, a perfect weekend day trip for anyone interning in Northeast Florida.",
    link: "https://www.artsmarketofsa.com",
    recurring: true
  },
  {
    id: 13,
    title: "Jax River Jams: Embracing the Culture of Duval",
    categories: ["Arts & Culture", "Outdoors"],
    date: "Multiple dates, Summer 2026",
    location: "Metropolitan Park, Downtown Jacksonville",
    price: "Free",
    free: true,
    icon: "fa-solid fa-guitar",
    color: "#AD1457",
    description: "A four-day, free concert series bringing local and internationally known artists to the riverfront at Metropolitan Park. One of Jacksonville's most beloved summer music festivals.",
    link: "https://folioweekly.com/2026/06/18/summer-festival-season-2026/",
    recurring: false
  },
  {
    id: 14,
    title: "The Music of David Bowie (Symphonic)",
    categories: ["Arts & Culture"],
    date: "August 8, 2026",
    location: "Florida Theatre, 128 E Forsyth St, Downtown Jacksonville",
    price: "Tickets from $35",
    free: false,
    icon: "fa-solid fa-music",
    color: "#5E35B1",
    description: "A symphonic rock tribute to David Bowie at the historic Florida Theatre, part of the city's packed summer concert calendar.",
    link: "https://folioweekly.com/2026/06/18/summer-festival-season-2026/",
    recurring: false
  },
  {
    id: 15,
    title: "Friday Night Dance Party at the Pier",
    categories: ["Outdoors", "Arts & Culture"],
    date: "Every Friday",
    location: "Jacksonville Beach Fishing Pier",
    price: "Free",
    free: true,
    icon: "fa-solid fa-music",
    color: "#00897B",
    description: "A unique all-ages dance party at the Jacksonville Beach Pier with multiple music channels, an easy weekly beachside meetup.",
    link: "https://folioweekly.com/2026/06/18/summer-festival-season-2026/",
    recurring: true
  },
  {
    id: 16,
    title: "Beaches Green Market",
    categories: ["Food & Market", "Outdoors"],
    date: "Saturdays, 10 AM-2 PM",
    location: "Penman Park, 321 Penman Rd, Jacksonville Beach",
    price: "Free entry",
    free: true,
    icon: "fa-solid fa-leaf",
    color: "#2E7D32",
    description: "A Saturday-morning green market at Penman Park with local produce, makers, and live music, an easy weekend hang at the Beaches.",
    link: "https://www.jacksonvillebeach.org/calendar.aspx?CID=23",
    recurring: true
  }
];

let activeEventFilters = new Set();

/* ════════════════════════════════════
   CONNECTJAX DATA
═══════════════════════════════════ */
const avatarColors = ['#0D2F6B','#00695C','#AD1457','#E65100','#1565C0','#6A1B9A','#00838F','#558B2F','#F57F17','#4527A0'];

function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarColors[Math.abs(h) % avatarColors.length];
}

function initials(name) {
  return name.split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase();
}

const interns = [
  {
    id: 1, name: "Aaliyah Johnson", type: "College",
    company: "UF Health Jacksonville", email: "aaliyah.j@ufhealth.edu",
    linkedin: "https://www.linkedin.com/in/aaliyah-johnson",
    school: "University of Florida", major: "Nursing",
    interests: ["Healthcare", "Community Health", "Volleyball", "Photography"],
    photo: null
  },
  {
    id: 2, name: "Marcus Rivera", type: "College",
    company: "CSX Transportation", email: "mrivera@fsu.edu",
    linkedin: "https://www.linkedin.com/in/marcus-rivera",
    school: "Florida State University", major: "Mechanical Engineering",
    interests: ["Transportation", "Sustainability", "Hiking", "Music"],
    photo: null
  },
  {
    id: 3, name: "Destiny Williams", type: "High School",
    company: "VyStar Credit Union", email: "d.williams@student.duvalschools.org",
    school: "Riverside High School", major: "11th Grade / Finance CTE",
    interests: ["Finance", "Entrepreneurship", "Art", "Dance"],
    photo: null
  },
  {
    id: 4, name: "Jordan Kim", type: "College",
    company: "Black Knight", email: "jordan.kim@gatech.edu",
    linkedin: "https://www.linkedin.com/in/jordan-kim",
    school: "Georgia Tech", major: "Computer Science",
    interests: ["Software Engineering", "AI/ML", "Gaming", "Rock Climbing"],
    photo: null
  },
  {
    id: 5, name: "Simone Carter", type: "College",
    company: "Mayo Clinic Florida", email: "simone.carter@unf.edu",
    linkedin: "https://www.linkedin.com/in/simone-carter",
    school: "University of North Florida", major: "Pre-Medicine / Biology",
    interests: ["Research", "Public Health", "Running", "Cooking"],
    photo: null
  },
  {
    id: 6, name: "Elijah Thompson", type: "High School",
    company: "VyStar Credit Union", email: "e.thompson@student.duvalschools.org",
    linkedin: "https://www.linkedin.com/in/elijah-thompson",
    school: "Bartram Trail High School", major: "12th Grade / Business Academy",
    interests: ["Finance", "Basketball", "Podcasting", "Real Estate"],
    photo: null
  },
  {
    id: 7, name: "Priya Nair", type: "College",
    company: "Fidelity Investments", email: "pnair@fiu.edu",
    linkedin: "https://www.linkedin.com/in/priya-nair",
    school: "Florida International University", major: "Finance",
    interests: ["Investing", "Data Analytics", "Yoga", "Travel"],
    photo: null
  },
  {
    id: 8, name: "Tyler Broussard", type: "College",
    company: "JAXPORT", email: "t.broussard@jcu.edu",
    linkedin: "https://www.linkedin.com/in/tyler-broussard",
    school: "Jacksonville University", major: "Logistics & Supply Chain",
    interests: ["International Trade", "Sailing", "History", "Photography"],
    photo: null
  },
  {
    id: 9, name: "Naomi Osei", type: "High School",
    company: "Nemours Children's Health", email: "n.osei@student.duvalschools.org",
    school: "First Coast High School", major: "11th Grade / Health Sciences",
    interests: ["Pediatrics", "Volunteering", "Creative Writing", "Track & Field"],
    photo: null
  },
  {
    id: 10, name: "Carlos Mendez", type: "College",
    company: "JEA", email: "cmendez@unf.edu",
    linkedin: "https://www.linkedin.com/in/carlos-mendez",
    school: "University of North Florida", major: "Electrical Engineering",
    interests: ["Renewable Energy", "Smart Grids", "Soccer", "3D Printing"],
    photo: null
  },
  {
    id: 11, name: "Imani Brooks", type: "College",
    company: "City of Jacksonville", email: "ibrooks@famu.edu",
    linkedin: "https://www.linkedin.com/in/imani-brooks",
    school: "Florida A&M University", major: "Political Science / Public Policy",
    interests: ["Civic Tech", "Urban Planning", "Community Organizing", "Poetry"],
    photo: null
  },
  {
    id: 12, name: "Noah Fitzgerald", type: "College",
    company: "Miller Electric Company", email: "nfitz@fscj.edu",
    linkedin: "https://www.linkedin.com/in/noah-fitzgerald",
    school: "Florida State College at Jacksonville", major: "Construction Management",
    interests: ["Construction", "Architecture", "Fishing", "Cars"],
    photo: null
  },
  {
    id: 13, name: "Amara Diallo", type: "College",
    company: "Duval County Public Schools", email: "a.diallo@unf.edu",
    linkedin: "https://www.linkedin.com/in/amara-diallo",
    school: "University of North Florida", major: "Education / Child Development",
    interests: ["Education Policy", "Youth Mentoring", "Dance", "French Language"],
    photo: null
  },
  {
    id: 14, name: "Sean Murphy", type: "College",
    company: "Black Knight", email: "smurphy@gatech.edu",
    linkedin: "https://www.linkedin.com/in/sean-murphy",
    school: "Georgia Tech", major: "Data Science",
    interests: ["Data Engineering", "Machine Learning", "Baseball", "Chess"],
    photo: null
  },
  {
    id: 15, name: "Kezia Okafor", type: "High School",
    company: "Jacksonville Public Library", email: "k.okafor@student.duvalschools.org",
    school: "Mandarin High School", major: "12th Grade",
    interests: ["Literacy", "Creative Writing", "Film", "Community Service"],
    photo: null
  },
  {
    id: 16, name: "Devon Santiago", type: "College",
    company: "CSX Transportation", email: "dsantiago@fsu.edu",
    linkedin: "https://www.linkedin.com/in/devon-santiago",
    school: "Florida State University", major: "Industrial Engineering",
    interests: ["Logistics", "Operations Research", "Golf", "Podcasting"],
    photo: null
  },
  {
    id: 17, name: "Fatima Hassan", type: "College",
    company: "Mayo Clinic Florida", email: "fhassan@uf.edu",
    linkedin: "https://www.linkedin.com/in/fatima-hassan",
    school: "University of Florida", major: "Biochemistry",
    interests: ["Clinical Research", "Global Health", "Cooking", "Soccer"],
    photo: null
  },
  {
    id: 18, name: "Liam Oconnor", type: "College",
    company: "Fidelity Investments", email: "loconnor@jcu.edu",
    linkedin: "https://www.linkedin.com/in/liam-oconnor",
    school: "Jacksonville University", major: "Business Analytics",
    interests: ["Stock Market", "Economics", "Surfing", "Photography"],
    photo: null
  }
];

const rsvpData = {}; // eventId → Set of intern names
const MY_NAME = "You"; // represents the logged-in user

let mapInitialized = false;
let mapInstance = null;

