// Baza danych zawodników z prawdziwymi życiówkami
const SWIMMERS_DATABASE = [
    // MĘŻCZYŹNI - Krauliści
    { id: 1, name: "Ksawery Masiuk", gender: "M", specialty: "freestyle", events: ["50m", "100m"], pb: { "50m_25": "21.30", "50m_50": "21.45", "100m_25": "46.86", "100m_50": "47.52" }, level: 95 },
    { id: 2, name: "Kamil Sieradzki", gender: "M", specialty: "freestyle", events: ["50m", "100m", "200m"], pb: { "50m_25": "21.89", "50m_50": "22.15", "100m_25": "48.12", "100m_50": "48.89", "200m_50": "1:47.23" }, level: 88 },
    { id: 3, name: "Jakub Majerski", gender: "M", specialty: "freestyle", events: ["100m", "200m"], pb: { "100m_25": "48.45", "100m_50": "49.01", "200m_25": "1:45.67", "200m_50": "1:46.88" }, level: 87 },
    { id: 4, name: "Kacper Stokowski", gender: "M", specialty: "freestyle", events: ["200m", "400m"], pb: { "200m_25": "1:46.89", "200m_50": "1:47.92", "400m_25": "3:46.23", "400m_50": "3:48.76" }, level: 85 },
    { id: 5, name: "Wojciech Wojdak", gender: "M", specialty: "freestyle", events: ["400m", "800m", "1500m"], pb: { "400m_25": "3:48.92", "400m_50": "3:50.45", "800m_25": "7:52.34", "800m_50": "7:58.12", "1500m_50": "15:12.45" }, level: 84 },
    
    // MĘŻCZYŹNI - Grzbieciści
    { id: 6, name: "Kacper Stokowski", gender: "M", specialty: "backstroke", events: ["50m", "100m", "200m"], pb: { "50m_25": "24.12", "50m_50": "24.56", "100m_25": "52.89", "100m_50": "53.67", "200m_50": "1:58.34" }, level: 86 },
    { id: 7, name: "Ksawery Masiuk", gender: "M", specialty: "backstroke", events: ["50m", "100m"], pb: { "50m_25": "23.98", "50m_50": "24.34", "100m_25": "52.45", "100m_50": "53.12" }, level: 90 },
    { id: 8, name: "Radosław Kawęcki", gender: "M", specialty: "backstroke", events: ["100m", "200m"], pb: { "100m_25": "53.67", "100m_50": "54.23", "200m_25": "1:56.89", "200m_50": "1:58.12" }, level: 82 },
    
    // MĘŻCZYŹNI - Żabkiści
    { id: 9, name: "Jan Hołub", gender: "M", specialty: "breaststroke", events: ["50m", "100m", "200m"], pb: { "50m_25": "26.89", "50m_50": "27.34", "100m_25": "58.67", "100m_50": "59.45", "200m_50": "2:09.78" }, level: 91 },
    { id: 10, name: "Kacper Stokowski", gender: "M", specialty: "breaststroke", events: ["50m", "100m", "200m"], pb: { "50m_25": "27.12", "50m_50": "27.56", "100m_25": "59.23", "100m_50": "1:00.12", "200m_50": "2:11.45" }, level: 85 },
    { id: 11, name: "Dominik Makowski", gender: "M", specialty: "breaststroke", events: ["100m", "200m"], pb: { "100m_25": "1:00.45", "100m_50": "1:01.23", "200m_25": "2:11.89", "200m_50": "2:13.67" }, level: 78 },
    
    // MĘŻCZYŹNI - Delfiniści
    { id: 12, name: "Jakub Majerski", gender: "M", specialty: "butterfly", events: ["50m", "100m", "200m"], pb: { "50m_25": "23.12", "50m_50": "23.67", "100m_25": "51.45", "100m_50": "52.34", "200m_50": "1:56.78" }, level: 89 },
    { id: 13, name: "Krzysztof Chmielewski", gender: "M", specialty: "butterfly", events: ["100m", "200m"], pb: { "100m_25": "52.78", "100m_50": "53.45", "200m_25": "1:58.23", "200m_50": "1:59.89" }, level: 84 },
    { id: 14, name: "Kacper Stokowski", gender: "M", specialty: "butterfly", events: ["50m", "100m", "200m"], pb: { "50m_25": "23.56", "50m_50": "24.12", "100m_25": "52.34", "100m_50": "53.12", "200m_50": "1:58.45" }, level: 85 },
    
    // MĘŻCZYŹNI - Zmienniści
    { id: 15, name: "Kacper Stokowski", gender: "M", specialty: "medley", events: ["200m", "400m"], pb: { "200m_25": "1:58.67", "200m_50": "2:00.34", "400m_25": "4:16.78", "400m_50": "4:20.45" }, level: 87 },
    { id: 16, name: "Jakub Skierka", gender: "M", specialty: "medley", events: ["200m", "400m"], pb: { "200m_25": "2:01.45", "200m_50": "2:03.12", "400m_25": "4:22.56", "400m_50": "4:25.89" }, level: 80 },
    
    // KOBIETY - Kraulistki
    { id: 17, name: "Katarzyna Wasick", gender: "K", specialty: "freestyle", events: ["50m", "100m"], pb: { "50m_25": "23.67", "50m_50": "24.08", "100m_25": "52.34", "100m_50": "53.12" }, level: 93 },
    { id: 18, name: "Kornelia Fiedkiewicz", gender: "K", specialty: "freestyle", events: ["100m", "200m"], pb: { "100m_25": "54.23", "100m_50": "54.89", "200m_25": "1:58.45", "200m_50": "1:59.78" }, level: 87 },
    { id: 19, name: "Paulina Peda", gender: "K", specialty: "freestyle", events: ["50m", "100m"], pb: { "50m_25": "24.56", "50m_50": "25.12", "100m_25": "54.78", "100m_50": "55.45" }, level: 82 },
    { id: 20, name: "Aleksandra Polańska", gender: "K", specialty: "freestyle", events: ["200m", "400m", "800m"], pb: { "200m_25": "2:00.34", "200m_50": "2:01.89", "400m_25": "4:10.23", "400m_50": "4:13.67", "800m_50": "8:35.12" }, level: 85 },
    { id: 21, name: "Julia Maik", gender: "K", specialty: "freestyle", events: ["400m", "800m", "1500m"], pb: { "400m_25": "4:12.56", "400m_50": "4:15.23", "800m_25": "8:32.45", "800m_50": "8:38.78", "1500m_50": "16:25.34" }, level: 84 },
    
    // KOBIETY - Grzbiecistki
    { id: 22, name: "Laura Bernat", gender: "K", specialty: "backstroke", events: ["50m", "100m", "200m"], pb: { "50m_25": "27.89", "50m_50": "28.34", "100m_25": "1:00.12", "100m_50": "1:00.89", "200m_50": "2:11.45" }, level: 86 },
    { id: 23, name: "Adela Piskorska", gender: "K", specialty: "backstroke", events: ["100m", "200m"], pb: { "100m_25": "1:01.23", "100m_50": "1:02.12", "200m_25": "2:12.67", "200m_50": "2:14.23" }, level: 80 },
    
    // KOBIETY - Żabkistki
    { id: 24, name: "Dominika Sztandera", gender: "K", specialty: "breaststroke", events: ["50m", "100m", "200m"], pb: { "50m_25": "30.45", "50m_50": "30.89", "100m_25": "1:06.78", "100m_50": "1:07.56", "200m_50": "2:26.34" }, level: 88 },
    { id: 25, name: "Karolina Kuś", gender: "K", specialty: "breaststroke", events: ["50m", "100m"], pb: { "50m_25": "31.12", "50m_50": "31.67", "100m_25": "1:08.45", "100m_50": "1:09.23" }, level: 79 },
    
    // KOBIETY - Delfinistki
    { id: 26, name: "Kornelia Fiedkiewicz", gender: "K", specialty: "butterfly", events: ["50m", "100m", "200m"], pb: { "50m_25": "26.34", "50m_50": "26.89", "100m_25": "58.12", "100m_50": "59.01", "200m_50": "2:10.45" }, level: 87 },
    { id: 27, name: "Alicja Tchórz", gender: "K", specialty: "butterfly", events: ["100m", "200m"], pb: { "100m_25": "59.67", "100m_50": "1:00.45", "200m_25": "2:11.89", "200m_50": "2:13.56" }, level: 84 },
    
    // KOBIETY - Zmienniczki
    { id: 28, name: "Alicja Tchórz", gender: "K", specialty: "medley", events: ["200m", "400m"], pb: { "200m_25": "2:12.45", "200m_50": "2:14.23", "400m_25": "4:42.67", "400m_50": "4:46.89" }, level: 85 },
    { id: 29, name: "Laura Bernat", gender: "K", specialty: "medley", events: ["200m", "400m"], pb: { "200m_25": "2:14.78", "200m_50": "2:16.45", "400m_25": "4:48.23", "400m_50": "4:52.34" }, level: 82 },
    
    // Dodatkowi zawodnicy (słabsi)
    { id: 30, name: "Bartosz Piszczorowicz", gender: "M", specialty: "freestyle", events: ["50m", "100m"], pb: { "50m_25": "22.67", "50m_50": "23.12", "100m_25": "50.23", "100m_50": "51.01" }, level: 75 },
    { id: 31, name: "Mateusz Chowaniec", gender: "M", specialty: "breaststroke", events: ["100m", "200m"], pb: { "100m_25": "1:02.34", "100m_50": "1:03.45", "200m_50": "2:18.67" }, level: 72 },
    { id: 32, name: "Oliwia Jabłońska", gender: "K", specialty: "freestyle", events: ["100m", "200m"], pb: { "100m_25": "56.78", "100m_50": "57.45", "200m_50": "2:05.23" }, level: 74 },
    { id: 33, name: "Natalia Mazur", gender: "K", specialty: "backstroke", events: ["100m", "200m"], pb: { "100m_25": "1:03.45", "100m_50": "1:04.56", "200m_50": "2:18.90" }, level: 71 }
];

// Typy zawodów
const COMPETITION_TYPES = [
    { name: "Puchar Świata", prestige: 70, prize: 50000 },
    { name: "Mistrzostwa Europy", prestige: 85, prize: 100000 },
    { name: "Mistrzostwa Świata", prestige: 95, prize: 150000 },
    { name: "Igrzyska Olimpijskie", prestige: 100, prize: 200000 }
];

// Konkurencje pływackie
const EVENTS = {
    freestyle: [
        { distance: "50m", relay: false },
        { distance: "100m", relay: false },
        { distance: "200m", relay: false },
        { distance: "400m", relay: false },
        { distance: "800m", relay: false, gender: "K" },
        { distance: "1500m", relay: false, gender: "M" },
        { distance: "4x100m", relay: true },
        { distance: "4x200m", relay: true }
    ],
    backstroke: [
        { distance: "50m", relay: false },
        { distance: "100m", relay: false },
        { distance: "200m", relay: false }
    ],
    breaststroke: [
        { distance: "50m", relay: false },
        { distance: "100m", relay: false },
        { distance: "200m", relay: false }
    ],
    butterfly: [
        { distance: "50m", relay: false },
        { distance: "100m", relay: false },
        { distance: "200m", relay: false }
    ],
    medley: [
        { distance: "200m", relay: false },
        { distance: "400m", relay: false },
        { distance: "4x100m", relay: true }
    ]
};

// Kraje rywalizujące
const COUNTRIES = [
    { code: "POL", name: "Polska", strength: 75 },
    { code: "USA", name: "USA", strength: 98 },
    { code: "AUS", name: "Australia", strength: 95 },
    { code: "GBR", name: "Wielka Brytania", strength: 90 },
    { code: "CHN", name: "Chiny", strength: 92 },
    { code: "JPN", name: "Japonia", strength: 88 },
    { code: "FRA", name: "Francja", strength: 85 },
    { code: "ITA", name: "Włochy", strength: 84 },
    { code: "GER", name: "Niemcy", strength: 82 },
    { code: "NED", name: "Holandia", strength: 86 },
    { code: "HUN", name: "Węgry", strength: 80 },
    { code: "RSA", name: "RPA", strength: 81 },
    { code: "BRA", name: "Brazylia", strength: 78 },
    { code: "CAN", name: "Kanada", strength: 83 },
    { code: "SWE", name: "Szwecja", strength: 79 }
];

// Szablony wiadomości
const NEWS_TEMPLATES = {
    greatForm: [
        "{swimmer} w niesamowitej formie!",
        "Rewelacyjna dyspozycja {swimmer}!",
        "{swimmer} trenuje świetnie - forma rośnie!",
        "Trener chwali {swimmer} - kapitalna forma!"
    ],
    injury: [
        "{swimmer} doznał kontuzji - naciągnięcie mięśnia",
        "Przykra wiadomość: {swimmer} kontuzjowany",
        "{swimmer} musi pauzować z powodu kontuzji"
    ],
    illness: [
        "{swimmer} przeziębiony - nie trenuje",
        "{swimmer} chory - wątpliwy start",
        "Choroba wyklucza {swimmer} z treningów"
    ],
    gold: [
        "ZŁOTO! {swimmer} triumfuje na {competition}!",
        "Polska ma złoto! {swimmer} wygrywa {event}!",
        "Niesamowite! {swimmer} ze złotym medalem!"
    ],
    relayGold: [
        "POLSKA MA ZŁOTO W SZTAFECIE! Skład: {relay}",
        "TRIUMF SZTAFETY! {relay} ze złotem!",
        "Niesamowita sztafeta! Złoto dla Polski: {relay}"
    ],
    silver: [
        "{swimmer} ze srebrnym medalem na {competition}!",
        "Srebro dla Polski! {swimmer} drugi w {event}",
        "{swimmer} tuż za podium - srebrny medal!"
    ],
    bronze: [
        "{swimmer} z brązowym medalem!",
        "Brąz dla {swimmer} na {competition}!",
        "Podium! {swimmer} trzeci w {event}"
    ],
    pb: [
        "ŻYCIÓWKA! {swimmer} poprawia rekord do {time}!",
        "{swimmer} z nowym rekordem życiowym: {time}!",
        "Fantastyczny wynik! {swimmer} - {time} (życiówka!)"
    ]
};
