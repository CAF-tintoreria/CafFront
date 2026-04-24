export const clientesEjemplo = [
  { id: 1, nombre: "Juan Pérez", contacto: "juan@email.com" },
  { id: 2, nombre: "María García", contacto: "maria@email.com" },
  { id: 3, nombre: "Carlos López", contacto: "carlos@email.com" },
  { id: 4, nombre: "Ana Martínez", contacto: "ana@email.com" },
  { id: 5, nombre: "Luis Rodríguez", contacto: "luis@email.com" },
];

export const prendasMock = [
  // 1–10
  {
    prendaID: 1, tipoPrenda: "Remera", nroCorte: 1001, cantidadUnidades: 50,
    pesoKilos: 2.5, cantidadBolsas: 2, fechaIngreso: "2025-09-15",
    remito: "R-001", estadoPrendaID: 1, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" },
    muestra: { clotheType: "Remera XS – color base" }
  },
  {
    prendaID: 2, tipoPrenda: "Pantalón", nroCorte: 1002, cantidadUnidades: 40,
    pesoKilos: 3.2, cantidadBolsas: 3, fechaIngreso: "2025-09-14",
    remito: "R-002", estadoPrendaID: 2, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 3, tipoPrenda: "Buzo", nroCorte: 1003, cantidadUnidades: 30,
    pesoKilos: 4.1, cantidadBolsas: 3, fechaIngreso: "2025-09-13",
    remito: "R-003", estadoPrendaID: 3, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 4, tipoPrenda: "Camisa", nroCorte: 1004, cantidadUnidades: 24,
    pesoKilos: 2.0, cantidadBolsas: 2, fechaIngreso: "2025-09-12",
    remito: "R-004", estadoPrendaID: 4, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 5, tipoPrenda: "Chomba", nroCorte: 1005, cantidadUnidades: 60,
    pesoKilos: 3.8, cantidadBolsas: 4, fechaIngreso: "2025-09-11",
    remito: "R-005", estadoPrendaID: 1, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" },
    muestra: { clotheType: "Chomba M – muestra verde" }
  },
  {
    prendaID: 6, tipoPrenda: "Short", nroCorte: 1006, cantidadUnidades: 80,
    pesoKilos: 5.5, cantidadBolsas: 5, fechaIngreso: "2025-09-10",
    remito: "R-006", estadoPrendaID: 2, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" }
  },
  {
    prendaID: 7, tipoPrenda: "Pollera", nroCorte: 1007, cantidadUnidades: 18,
    pesoKilos: 1.6, cantidadBolsas: 2, fechaIngreso: "2025-09-09",
    remito: "R-007", estadoPrendaID: 3, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" }
  },
  {
    prendaID: 8, tipoPrenda: "Campera", nroCorte: 1008, cantidadUnidades: 12,
    pesoKilos: 6.0, cantidadBolsas: 2, fechaIngreso: "2025-09-08",
    remito: "R-008", estadoPrendaID: 4, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 9, tipoPrenda: "Remera", nroCorte: 1009, cantidadUnidades: 55,
    pesoKilos: 2.7, cantidadBolsas: 3, fechaIngreso: "2025-09-07",
    remito: "R-009", estadoPrendaID: 1, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 10, tipoPrenda: "Pantalón", nroCorte: 1010, cantidadUnidades: 42,
    pesoKilos: 3.0, cantidadBolsas: 3, fechaIngreso: "2025-09-06",
    remito: "R-010", estadoPrendaID: 2, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },

  // 11–20
  {
    prendaID: 11, tipoPrenda: "Buzo", nroCorte: 1011, cantidadUnidades: 28,
    pesoKilos: 3.9, cantidadBolsas: 3, fechaIngreso: "2025-09-05",
    remito: "R-011", estadoPrendaID: 3, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 12, tipoPrenda: "Camisa", nroCorte: 1012, cantidadUnidades: 36,
    pesoKilos: 2.4, cantidadBolsas: 3, fechaIngreso: "2025-09-04",
    remito: "R-012", estadoPrendaID: 4, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 13, tipoPrenda: "Chomba", nroCorte: 1013, cantidadUnidades: 45,
    pesoKilos: 2.9, cantidadBolsas: 3, fechaIngreso: "2025-09-03",
    remito: "R-013", estadoPrendaID: 1, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 14, tipoPrenda: "Short", nroCorte: 1014, cantidadUnidades: 70,
    pesoKilos: 4.8, cantidadBolsas: 5, fechaIngreso: "2025-09-02",
    remito: "R-014", estadoPrendaID: 2, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" },
    muestra: { clotheType: "Short S – corte 1014" }
  },
  {
    prendaID: 15, tipoPrenda: "Pollera", nroCorte: 1015, cantidadUnidades: 20,
    pesoKilos: 1.8, cantidadBolsas: 2, fechaIngreso: "2025-09-01",
    remito: "R-015", estadoPrendaID: 3, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" }
  },
  {
    prendaID: 16, tipoPrenda: "Campera", nroCorte: 1016, cantidadUnidades: 16,
    pesoKilos: 7.1, cantidadBolsas: 3, fechaIngreso: "2025-08-30",
    remito: "R-016", estadoPrendaID: 4, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" }
  },
  {
    prendaID: 17, tipoPrenda: "Remera", nroCorte: 1017, cantidadUnidades: 52,
    pesoKilos: 2.6, cantidadBolsas: 3, fechaIngreso: "2025-08-29",
    remito: "R-017", estadoPrendaID: 1, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" }
  },
  {
    prendaID: 18, tipoPrenda: "Pantalón", nroCorte: 1018, cantidadUnidades: 39,
    pesoKilos: 3.1, cantidadBolsas: 3, fechaIngreso: "2025-08-28",
    remito: "R-018", estadoPrendaID: 2, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 19, tipoPrenda: "Buzo", nroCorte: 1019, cantidadUnidades: 27,
    pesoKilos: 3.6, cantidadBolsas: 3, fechaIngreso: "2025-08-27",
    remito: "R-019", estadoPrendaID: 3, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 20, tipoPrenda: "Camisa", nroCorte: 1020, cantidadUnidades: 34,
    pesoKilos: 2.3, cantidadBolsas: 3, fechaIngreso: "2025-08-26",
    remito: "R-020", estadoPrendaID: 4, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },

  // 21–30
  {
    prendaID: 21, tipoPrenda: "Chomba", nroCorte: 1021, cantidadUnidades: 48,
    pesoKilos: 3.0, cantidadBolsas: 3, fechaIngreso: "2025-08-25",
    remito: "R-021", estadoPrendaID: 1, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 22, tipoPrenda: "Short", nroCorte: 1022, cantidadUnidades: 76,
    pesoKilos: 4.6, cantidadBolsas: 5, fechaIngreso: "2025-08-24",
    remito: "R-022", estadoPrendaID: 2, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 23, tipoPrenda: "Pollera", nroCorte: 1023, cantidadUnidades: 22,
    pesoKilos: 1.9, cantidadBolsas: 2, fechaIngreso: "2025-08-23",
    remito: "R-023", estadoPrendaID: 3, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 24, tipoPrenda: "Campera", nroCorte: 1024, cantidadUnidades: 14,
    pesoKilos: 6.4, cantidadBolsas: 2, fechaIngreso: "2025-08-22",
    remito: "R-024", estadoPrendaID: 4, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 25, tipoPrenda: "Remera", nroCorte: 1025, cantidadUnidades: 58,
    pesoKilos: 2.8, cantidadBolsas: 3, fechaIngreso: "2025-08-21",
    remito: "R-025", estadoPrendaID: 1, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" },
    muestra: { clotheType: "Remera L – batik azul" }
  },
  {
    prendaID: 26, tipoPrenda: "Pantalón", nroCorte: 1026, cantidadUnidades: 41,
    pesoKilos: 3.3, cantidadBolsas: 3, fechaIngreso: "2025-08-20",
    remito: "R-026", estadoPrendaID: 2, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" }
  },
  {
    prendaID: 27, tipoPrenda: "Buzo", nroCorte: 1027, cantidadUnidades: 25,
    pesoKilos: 3.5, cantidadBolsas: 3, fechaIngreso: "2025-08-19",
    remito: "R-027", estadoPrendaID: 3, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" }
  },
  {
    prendaID: 28, tipoPrenda: "Camisa", nroCorte: 1028, cantidadUnidades: 38,
    pesoKilos: 2.5, cantidadBolsas: 3, fechaIngreso: "2025-08-18",
    remito: "R-028", estadoPrendaID: 4, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 29, tipoPrenda: "Chomba", nroCorte: 1029, cantidadUnidades: 46,
    pesoKilos: 3.1, cantidadBolsas: 3, fechaIngreso: "2025-08-17",
    remito: "R-029", estadoPrendaID: 1, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 30, tipoPrenda: "Short", nroCorte: 1030, cantidadUnidades: 72,
    pesoKilos: 4.7, cantidadBolsas: 5, fechaIngreso: "2025-08-16",
    remito: "R-030", estadoPrendaID: 2, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },

  // 31–40
  {
    prendaID: 31, tipoPrenda: "Pollera", nroCorte: 1031, cantidadUnidades: 21,
    pesoKilos: 1.7, cantidadBolsas: 2, fechaIngreso: "2025-08-15",
    remito: "R-031", estadoPrendaID: 3, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 32, tipoPrenda: "Campera", nroCorte: 1032, cantidadUnidades: 18,
    pesoKilos: 6.2, cantidadBolsas: 2, fechaIngreso: "2025-08-14",
    remito: "R-032", estadoPrendaID: 4, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 33, tipoPrenda: "Remera", nroCorte: 1033, cantidadUnidades: 56,
    pesoKilos: 2.9, cantidadBolsas: 3, fechaIngreso: "2025-08-13",
    remito: "R-033", estadoPrendaID: 1, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 34, tipoPrenda: "Pantalón", nroCorte: 1034, cantidadUnidades: 43,
    pesoKilos: 3.4, cantidadBolsas: 3, fechaIngreso: "2025-08-12",
    remito: "R-034", estadoPrendaID: 2, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 35, tipoPrenda: "Buzo", nroCorte: 1035, cantidadUnidades: 29,
    pesoKilos: 3.7, cantidadBolsas: 3, fechaIngreso: "2025-08-11",
    remito: "R-035", estadoPrendaID: 3, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" }
  },
  {
    prendaID: 36, tipoPrenda: "Camisa", nroCorte: 1036, cantidadUnidades: 37,
    pesoKilos: 2.6, cantidadBolsas: 3, fechaIngreso: "2025-08-10",
    remito: "R-036", estadoPrendaID: 4, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" }
  },
  {
    prendaID: 37, tipoPrenda: "Chomba", nroCorte: 1037, cantidadUnidades: 49,
    pesoKilos: 3.2, cantidadBolsas: 3, fechaIngreso: "2025-08-09",
    remito: "R-037", estadoPrendaID: 1, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" },
    muestra: { clotheType: "Chomba XL – logo tono" }
  },
  {
    prendaID: 38, tipoPrenda: "Short", nroCorte: 1038, cantidadUnidades: 74,
    pesoKilos: 4.9, cantidadBolsas: 5, fechaIngreso: "2025-08-08",
    remito: "R-038", estadoPrendaID: 2, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 39, tipoPrenda: "Pollera", nroCorte: 1039, cantidadUnidades: 23,
    pesoKilos: 2.0, cantidadBolsas: 2, fechaIngreso: "2025-08-07",
    remito: "R-039", estadoPrendaID: 3, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 40, tipoPrenda: "Campera", nroCorte: 1040, cantidadUnidades: 20,
    pesoKilos: 6.8, cantidadBolsas: 3, fechaIngreso: "2025-08-06",
    remito: "R-040", estadoPrendaID: 4, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },

  // 41–55
  {
    prendaID: 41, tipoPrenda: "Remera", nroCorte: 1041, cantidadUnidades: 53,
    pesoKilos: 2.7, cantidadBolsas: 3, fechaIngreso: "2025-08-05",
    remito: "R-041", estadoPrendaID: 1, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 42, tipoPrenda: "Pantalón", nroCorte: 1042, cantidadUnidades: 44,
    pesoKilos: 3.2, cantidadBolsas: 3, fechaIngreso: "2025-08-04",
    remito: "R-042", estadoPrendaID: 2, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 43, tipoPrenda: "Buzo", nroCorte: 1043, cantidadUnidades: 26,
    pesoKilos: 3.8, cantidadBolsas: 3, fechaIngreso: "2025-08-03",
    remito: "R-043", estadoPrendaID: 3, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 44, tipoPrenda: "Camisa", nroCorte: 1044, cantidadUnidades: 35,
    pesoKilos: 2.4, cantidadBolsas: 3, fechaIngreso: "2025-08-02",
    remito: "R-044", estadoPrendaID: 4, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 45, tipoPrenda: "Chomba", nroCorte: 1045, cantidadUnidades: 47,
    pesoKilos: 3.0, cantidadBolsas: 3, fechaIngreso: "2025-08-01",
    remito: "R-045", estadoPrendaID: 1, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" }
  },
  {
    prendaID: 46, tipoPrenda: "Short", nroCorte: 1046, cantidadUnidades: 78,
    pesoKilos: 5.1, cantidadBolsas: 5, fechaIngreso: "2025-07-31",
    remito: "R-046", estadoPrendaID: 2, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" },
    muestra: { clotheType: "Short M – prueba roja" }
  },
  {
    prendaID: 47, tipoPrenda: "Pollera", nroCorte: 1047, cantidadUnidades: 19,
    pesoKilos: 1.8, cantidadBolsas: 2, fechaIngreso: "2025-07-30",
    remito: "R-047", estadoPrendaID: 3, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" }
  },
  {
    prendaID: 48, tipoPrenda: "Campera", nroCorte: 1048, cantidadUnidades: 15,
    pesoKilos: 6.5, cantidadBolsas: 2, fechaIngreso: "2025-07-29",
    remito: "R-048", estadoPrendaID: 4, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 49, tipoPrenda: "Remera", nroCorte: 1049, cantidadUnidades: 57,
    pesoKilos: 2.9, cantidadBolsas: 3, fechaIngreso: "2025-07-28",
    remito: "R-049", estadoPrendaID: 1, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 50, tipoPrenda: "Pantalón", nroCorte: 1050, cantidadUnidades: 45,
    pesoKilos: 3.3, cantidadBolsas: 3, fechaIngreso: "2025-07-27",
    remito: "R-050", estadoPrendaID: 2, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },
  {
    prendaID: 51, tipoPrenda: "Buzo", nroCorte: 1051, cantidadUnidades: 31,
    pesoKilos: 3.9, cantidadBolsas: 3, fechaIngreso: "2025-07-26",
    remito: "R-051", estadoPrendaID: 3, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 52, tipoPrenda: "Camisa", nroCorte: 1052, cantidadUnidades: 33,
    pesoKilos: 2.5, cantidadBolsas: 3, fechaIngreso: "2025-07-25",
    remito: "R-052", estadoPrendaID: 4, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 53, tipoPrenda: "Chomba", nroCorte: 1053, cantidadUnidades: 50,
    pesoKilos: 3.2, cantidadBolsas: 3, fechaIngreso: "2025-07-24",
    remito: "R-053", estadoPrendaID: 1, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 54, tipoPrenda: "Short", nroCorte: 1054, cantidadUnidades: 79,
    pesoKilos: 5.2, cantidadBolsas: 5, fechaIngreso: "2025-07-23",
    remito: "R-054", estadoPrendaID: 2, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 55, tipoPrenda: "Pollera", nroCorte: 1055, cantidadUnidades: 24,
    pesoKilos: 2.1, cantidadBolsas: 2, fechaIngreso: "2025-07-22",
    remito: "R-055", estadoPrendaID: 3, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" }
  },
  {
    prendaID: 1, tipoPrenda: "Remera", nroCorte: 1001, cantidadUnidades: 50,
    pesoKilos: 2.5, cantidadBolsas: 2, fechaIngreso: "2025-09-15",
    remito: "R-001", estadoPrendaID: 1, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" },
    muestra: { clotheType: "Remera XS – color base" }
  },
  {
    prendaID: 2, tipoPrenda: "Pantalón", nroCorte: 1002, cantidadUnidades: 40,
    pesoKilos: 3.2, cantidadBolsas: 3, fechaIngreso: "2025-09-14",
    remito: "R-002", estadoPrendaID: 2, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 3, tipoPrenda: "Buzo", nroCorte: 1003, cantidadUnidades: 30,
    pesoKilos: 4.1, cantidadBolsas: 3, fechaIngreso: "2025-09-13",
    remito: "R-003", estadoPrendaID: 3, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 4, tipoPrenda: "Camisa", nroCorte: 1004, cantidadUnidades: 24,
    pesoKilos: 2.0, cantidadBolsas: 2, fechaIngreso: "2025-09-12",
    remito: "R-004", estadoPrendaID: 4, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 5, tipoPrenda: "Chomba", nroCorte: 1005, cantidadUnidades: 60,
    pesoKilos: 3.8, cantidadBolsas: 4, fechaIngreso: "2025-09-11",
    remito: "R-005", estadoPrendaID: 1, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" },
    muestra: { clotheType: "Chomba M – muestra verde" }
  },
  {
    prendaID: 6, tipoPrenda: "Short", nroCorte: 1006, cantidadUnidades: 80,
    pesoKilos: 5.5, cantidadBolsas: 5, fechaIngreso: "2025-09-10",
    remito: "R-006", estadoPrendaID: 2, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" }
  },
  {
    prendaID: 7, tipoPrenda: "Pollera", nroCorte: 1007, cantidadUnidades: 18,
    pesoKilos: 1.6, cantidadBolsas: 2, fechaIngreso: "2025-09-09",
    remito: "R-007", estadoPrendaID: 3, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" }
  },
  {
    prendaID: 8, tipoPrenda: "Campera", nroCorte: 1008, cantidadUnidades: 12,
    pesoKilos: 6.0, cantidadBolsas: 2, fechaIngreso: "2025-09-08",
    remito: "R-008", estadoPrendaID: 4, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 9, tipoPrenda: "Remera", nroCorte: 1009, cantidadUnidades: 55,
    pesoKilos: 2.7, cantidadBolsas: 3, fechaIngreso: "2025-09-07",
    remito: "R-009", estadoPrendaID: 1, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 10, tipoPrenda: "Pantalón", nroCorte: 1010, cantidadUnidades: 42,
    pesoKilos: 3.0, cantidadBolsas: 3, fechaIngreso: "2025-09-06",
    remito: "R-010", estadoPrendaID: 2, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },

  // 11–20
  {
    prendaID: 11, tipoPrenda: "Buzo", nroCorte: 1011, cantidadUnidades: 28,
    pesoKilos: 3.9, cantidadBolsas: 3, fechaIngreso: "2025-09-05",
    remito: "R-011", estadoPrendaID: 3, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 12, tipoPrenda: "Camisa", nroCorte: 1012, cantidadUnidades: 36,
    pesoKilos: 2.4, cantidadBolsas: 3, fechaIngreso: "2025-09-04",
    remito: "R-012", estadoPrendaID: 4, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 13, tipoPrenda: "Chomba", nroCorte: 1013, cantidadUnidades: 45,
    pesoKilos: 2.9, cantidadBolsas: 3, fechaIngreso: "2025-09-03",
    remito: "R-013", estadoPrendaID: 1, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 14, tipoPrenda: "Short", nroCorte: 1014, cantidadUnidades: 70,
    pesoKilos: 4.8, cantidadBolsas: 5, fechaIngreso: "2025-09-02",
    remito: "R-014", estadoPrendaID: 2, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" },
    muestra: { clotheType: "Short S – corte 1014" }
  },
  {
    prendaID: 15, tipoPrenda: "Pollera", nroCorte: 1015, cantidadUnidades: 20,
    pesoKilos: 1.8, cantidadBolsas: 2, fechaIngreso: "2025-09-01",
    remito: "R-015", estadoPrendaID: 3, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" }
  },
  {
    prendaID: 16, tipoPrenda: "Campera", nroCorte: 1016, cantidadUnidades: 16,
    pesoKilos: 7.1, cantidadBolsas: 3, fechaIngreso: "2025-08-30",
    remito: "R-016", estadoPrendaID: 4, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" }
  },
  {
    prendaID: 17, tipoPrenda: "Remera", nroCorte: 1017, cantidadUnidades: 52,
    pesoKilos: 2.6, cantidadBolsas: 3, fechaIngreso: "2025-08-29",
    remito: "R-017", estadoPrendaID: 1, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" }
  },
  {
    prendaID: 18, tipoPrenda: "Pantalón", nroCorte: 1018, cantidadUnidades: 39,
    pesoKilos: 3.1, cantidadBolsas: 3, fechaIngreso: "2025-08-28",
    remito: "R-018", estadoPrendaID: 2, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 19, tipoPrenda: "Buzo", nroCorte: 1019, cantidadUnidades: 27,
    pesoKilos: 3.6, cantidadBolsas: 3, fechaIngreso: "2025-08-27",
    remito: "R-019", estadoPrendaID: 3, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 20, tipoPrenda: "Camisa", nroCorte: 1020, cantidadUnidades: 34,
    pesoKilos: 2.3, cantidadBolsas: 3, fechaIngreso: "2025-08-26",
    remito: "R-020", estadoPrendaID: 4, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },

  // 21–30
  {
    prendaID: 21, tipoPrenda: "Chomba", nroCorte: 1021, cantidadUnidades: 48,
    pesoKilos: 3.0, cantidadBolsas: 3, fechaIngreso: "2025-08-25",
    remito: "R-021", estadoPrendaID: 1, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 22, tipoPrenda: "Short", nroCorte: 1022, cantidadUnidades: 76,
    pesoKilos: 4.6, cantidadBolsas: 5, fechaIngreso: "2025-08-24",
    remito: "R-022", estadoPrendaID: 2, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 23, tipoPrenda: "Pollera", nroCorte: 1023, cantidadUnidades: 22,
    pesoKilos: 1.9, cantidadBolsas: 2, fechaIngreso: "2025-08-23",
    remito: "R-023", estadoPrendaID: 3, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 24, tipoPrenda: "Campera", nroCorte: 1024, cantidadUnidades: 14,
    pesoKilos: 6.4, cantidadBolsas: 2, fechaIngreso: "2025-08-22",
    remito: "R-024", estadoPrendaID: 4, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 25, tipoPrenda: "Remera", nroCorte: 1025, cantidadUnidades: 58,
    pesoKilos: 2.8, cantidadBolsas: 3, fechaIngreso: "2025-08-21",
    remito: "R-025", estadoPrendaID: 1, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" },
    muestra: { clotheType: "Remera L – batik azul" }
  },
  {
    prendaID: 26, tipoPrenda: "Pantalón", nroCorte: 1026, cantidadUnidades: 41,
    pesoKilos: 3.3, cantidadBolsas: 3, fechaIngreso: "2025-08-20",
    remito: "R-026", estadoPrendaID: 2, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" }
  },
  {
    prendaID: 27, tipoPrenda: "Buzo", nroCorte: 1027, cantidadUnidades: 25,
    pesoKilos: 3.5, cantidadBolsas: 3, fechaIngreso: "2025-08-19",
    remito: "R-027", estadoPrendaID: 3, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" }
  },
  {
    prendaID: 28, tipoPrenda: "Camisa", nroCorte: 1028, cantidadUnidades: 38,
    pesoKilos: 2.5, cantidadBolsas: 3, fechaIngreso: "2025-08-18",
    remito: "R-028", estadoPrendaID: 4, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 29, tipoPrenda: "Chomba", nroCorte: 1029, cantidadUnidades: 46,
    pesoKilos: 3.1, cantidadBolsas: 3, fechaIngreso: "2025-08-17",
    remito: "R-029", estadoPrendaID: 1, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 30, tipoPrenda: "Short", nroCorte: 1030, cantidadUnidades: 72,
    pesoKilos: 4.7, cantidadBolsas: 5, fechaIngreso: "2025-08-16",
    remito: "R-030", estadoPrendaID: 2, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },

  // 31–40
  {
    prendaID: 31, tipoPrenda: "Pollera", nroCorte: 1031, cantidadUnidades: 21,
    pesoKilos: 1.7, cantidadBolsas: 2, fechaIngreso: "2025-08-15",
    remito: "R-031", estadoPrendaID: 3, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 32, tipoPrenda: "Campera", nroCorte: 1032, cantidadUnidades: 18,
    pesoKilos: 6.2, cantidadBolsas: 2, fechaIngreso: "2025-08-14",
    remito: "R-032", estadoPrendaID: 4, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 33, tipoPrenda: "Remera", nroCorte: 1033, cantidadUnidades: 56,
    pesoKilos: 2.9, cantidadBolsas: 3, fechaIngreso: "2025-08-13",
    remito: "R-033", estadoPrendaID: 1, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 34, tipoPrenda: "Pantalón", nroCorte: 1034, cantidadUnidades: 43,
    pesoKilos: 3.4, cantidadBolsas: 3, fechaIngreso: "2025-08-12",
    remito: "R-034", estadoPrendaID: 2, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 35, tipoPrenda: "Buzo", nroCorte: 1035, cantidadUnidades: 29,
    pesoKilos: 3.7, cantidadBolsas: 3, fechaIngreso: "2025-08-11",
    remito: "R-035", estadoPrendaID: 3, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" }
  },
  {
    prendaID: 36, tipoPrenda: "Camisa", nroCorte: 1036, cantidadUnidades: 37,
    pesoKilos: 2.6, cantidadBolsas: 3, fechaIngreso: "2025-08-10",
    remito: "R-036", estadoPrendaID: 4, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" }
  },
  {
    prendaID: 37, tipoPrenda: "Chomba", nroCorte: 1037, cantidadUnidades: 49,
    pesoKilos: 3.2, cantidadBolsas: 3, fechaIngreso: "2025-08-09",
    remito: "R-037", estadoPrendaID: 1, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" },
    muestra: { clotheType: "Chomba XL – logo tono" }
  },
  {
    prendaID: 38, tipoPrenda: "Short", nroCorte: 1038, cantidadUnidades: 74,
    pesoKilos: 4.9, cantidadBolsas: 5, fechaIngreso: "2025-08-08",
    remito: "R-038", estadoPrendaID: 2, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 39, tipoPrenda: "Pollera", nroCorte: 1039, cantidadUnidades: 23,
    pesoKilos: 2.0, cantidadBolsas: 2, fechaIngreso: "2025-08-07",
    remito: "R-039", estadoPrendaID: 3, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 40, tipoPrenda: "Campera", nroCorte: 1040, cantidadUnidades: 20,
    pesoKilos: 6.8, cantidadBolsas: 3, fechaIngreso: "2025-08-06",
    remito: "R-040", estadoPrendaID: 4, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },

  // 41–55
  {
    prendaID: 41, tipoPrenda: "Remera", nroCorte: 1041, cantidadUnidades: 53,
    pesoKilos: 2.7, cantidadBolsas: 3, fechaIngreso: "2025-08-05",
    remito: "R-041", estadoPrendaID: 1, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 42, tipoPrenda: "Pantalón", nroCorte: 1042, cantidadUnidades: 44,
    pesoKilos: 3.2, cantidadBolsas: 3, fechaIngreso: "2025-08-04",
    remito: "R-042", estadoPrendaID: 2, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 43, tipoPrenda: "Buzo", nroCorte: 1043, cantidadUnidades: 26,
    pesoKilos: 3.8, cantidadBolsas: 3, fechaIngreso: "2025-08-03",
    remito: "R-043", estadoPrendaID: 3, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 44, tipoPrenda: "Camisa", nroCorte: 1044, cantidadUnidades: 35,
    pesoKilos: 2.4, cantidadBolsas: 3, fechaIngreso: "2025-08-02",
    remito: "R-044", estadoPrendaID: 4, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 45, tipoPrenda: "Chomba", nroCorte: 1045, cantidadUnidades: 47,
    pesoKilos: 3.0, cantidadBolsas: 3, fechaIngreso: "2025-08-01",
    remito: "R-045", estadoPrendaID: 1, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" }
  },
  {
    prendaID: 46, tipoPrenda: "Short", nroCorte: 1046, cantidadUnidades: 78,
    pesoKilos: 5.1, cantidadBolsas: 5, fechaIngreso: "2025-07-31",
    remito: "R-046", estadoPrendaID: 2, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 6, username: "Lucía Sosa", contact: "lucia@example.com" },
    muestra: { clotheType: "Short M – prueba roja" }
  },
  {
    prendaID: 47, tipoPrenda: "Pollera", nroCorte: 1047, cantidadUnidades: 19,
    pesoKilos: 1.8, cantidadBolsas: 2, fechaIngreso: "2025-07-30",
    remito: "R-047", estadoPrendaID: 3, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 7, username: "Ricardo Díaz", contact: "ricardo@example.com" }
  },
  {
    prendaID: 48, tipoPrenda: "Campera", nroCorte: 1048, cantidadUnidades: 15,
    pesoKilos: 6.5, cantidadBolsas: 2, fechaIngreso: "2025-07-29",
    remito: "R-048", estadoPrendaID: 4, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 8, username: "Sofía Núñez", contact: "sofia@example.com" }
  },
  {
    prendaID: 49, tipoPrenda: "Remera", nroCorte: 1049, cantidadUnidades: 57,
    pesoKilos: 2.9, cantidadBolsas: 3, fechaIngreso: "2025-07-28",
    remito: "R-049", estadoPrendaID: 1, procesoID: 7, procesoNombre: "despacho",
    cliente: { clientID: 9, username: "Pedro Ramírez", contact: "pedro@example.com" }
  },
  {
    prendaID: 50, tipoPrenda: "Pantalón", nroCorte: 1050, cantidadUnidades: 45,
    pesoKilos: 3.3, cantidadBolsas: 3, fechaIngreso: "2025-07-27",
    remito: "R-050", estadoPrendaID: 2, procesoID: 1, procesoNombre: "lavado",
    cliente: { clientID: 10, username: "Valentina Ortiz", contact: "valen@example.com" }
  },
  {
    prendaID: 51, tipoPrenda: "Buzo", nroCorte: 1051, cantidadUnidades: 31,
    pesoKilos: 3.9, cantidadBolsas: 3, fechaIngreso: "2025-07-26",
    remito: "R-051", estadoPrendaID: 3, procesoID: 2, procesoNombre: "secado",
    cliente: { clientID: 1, username: "Juan Pérez", contact: "juan@example.com" }
  },
  {
    prendaID: 52, tipoPrenda: "Camisa", nroCorte: 1052, cantidadUnidades: 33,
    pesoKilos: 2.5, cantidadBolsas: 3, fechaIngreso: "2025-07-25",
    remito: "R-052", estadoPrendaID: 4, procesoID: 3, procesoNombre: "planchado",
    cliente: { clientID: 2, username: "María García", contact: "maria@example.com" }
  },
  {
    prendaID: 53, tipoPrenda: "Chomba", nroCorte: 1053, cantidadUnidades: 50,
    pesoKilos: 3.2, cantidadBolsas: 3, fechaIngreso: "2025-07-24",
    remito: "R-053", estadoPrendaID: 1, procesoID: 4, procesoNombre: "batik",
    cliente: { clientID: 3, username: "Carlos López", contact: "carlos@example.com" }
  },
  {
    prendaID: 54, tipoPrenda: "Short", nroCorte: 1054, cantidadUnidades: 79,
    pesoKilos: 5.2, cantidadBolsas: 5, fechaIngreso: "2025-07-23",
    remito: "R-054", estadoPrendaID: 2, procesoID: 5, procesoNombre: "teñido",
    cliente: { clientID: 4, username: "Ana Martínez", contact: "ana@example.com" }
  },
  {
    prendaID: 55, tipoPrenda: "Pollera", nroCorte: 1055, cantidadUnidades: 24,
    pesoKilos: 2.1, cantidadBolsas: 2, fechaIngreso: "2025-07-22",
    remito: "R-055", estadoPrendaID: 3, procesoID: 6, procesoNombre: "control",
    cliente: { clientID: 5, username: "Luis Rodríguez", contact: "luis@example.com" }
  }
];