(() => {
  const DATABASE_NAME = "forma-demo";
  const DATABASE_VERSION = 1;
  const STORES = ["claims", "appointments", "payments"];
  let databasePromise;

  function openDatabase() {
    if (!("indexedDB" in window)) {
      return Promise.reject(new Error("Ta przeglądarka nie obsługuje lokalnego zapisu danych."));
    }
    if (databasePromise) return databasePromise;

    databasePromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        STORES.forEach((storeName) => {
          if (!database.objectStoreNames.contains(storeName)) {
            database.createObjectStore(storeName, { keyPath: "id" });
          }
        });
      };
      request.onsuccess = () => {
        const database = request.result;
        database.onversionchange = () => database.close();
        resolve(database);
      };
      request.onerror = () => {
        databasePromise = null;
        reject(request.error || new Error("Nie udało się otworzyć lokalnej bazy danych."));
      };
      request.onblocked = () => {
        databasePromise = null;
        reject(new Error("Lokalna baza danych jest zablokowana przez inną otwartą kartę."));
      };
    });
    return databasePromise;
  }

  async function run(storeName, mode, action) {
    const database = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = database.transaction(storeName, mode);
      const request = action(transaction.objectStore(storeName));
      let result;
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => reject(request.error || new Error("Nie udało się odczytać lokalnych danych."));
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error || new Error("Operacja na lokalnej bazie danych nie powiodła się."));
      transaction.onabort = () => reject(transaction.error || new Error("Operacja na lokalnej bazie danych została przerwana."));
    });
  }

  window.FormaStore = Object.freeze({
    add: (storeName, value) => run(storeName, "readwrite", (store) => store.add(value)),
    get: (storeName, id) => run(storeName, "readonly", (store) => store.get(id)),
    getAll: (storeName) => run(storeName, "readonly", (store) => store.getAll()),
    put: (storeName, value) => run(storeName, "readwrite", (store) => store.put(value)),
    delete: (storeName, id) => run(storeName, "readwrite", (store) => store.delete(id))
  });

  window.FormaMail = Object.freeze({
    href(subject, body) {
      const params = `subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return `mailto:milozdzienicki@gmail.com?${params}`;
    },
    gmailHref(subject, body) {
      const params = new URLSearchParams({
        view: "cm",
        fs: "1",
        to: "milozdzienicki@gmail.com",
        su: subject,
        body
      });
      return `https://mail.google.com/mail/?${params.toString()}`;
    }
  });
})();
