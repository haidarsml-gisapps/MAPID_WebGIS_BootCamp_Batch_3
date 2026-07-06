
// --- Task 1: Interaksi JavaScript ---

// 1. Highlight KPI Cards
// Membuat tombol untuk mengubah warna kartu KPI
const highlightKpiButton = document.createElement("button");
highlightKpiButton.textContent = "Toggle KPI Highlight";
highlightKpiButton.classList.add("btn", "btn-primary", "mb-4"); // Menambahkan kelas CSS untuk styling

// Mencari bagian KPI Cards di halaman
const kpiCardsSection = document.querySelector(".kpi-cards");
if (kpiCardsSection) {
    // Memasukkan tombol sebelum bagian KPI Cards
    kpiCardsSection.parentNode.insertBefore(highlightKpiButton, kpiCardsSection);
}

// Menambahkan event listener untuk tombol highlight KPI
highlightKpiButton.addEventListener("click", () => {
    // Mencari semua kartu KPI
    const kpiCards = document.querySelectorAll(".kpi-card");
    kpiCards.forEach(card => {
        // Mengganti kelas 'highlight' untuk mengubah warna
        card.classList.toggle("highlight");
    });
});

// Menambahkan style sederhana untuk highlight (seharusnya ada di style.css)
const style = document.createElement("style");
style.innerHTML = `
    .kpi-card.highlight {
        background-color: #ffeb3b; /* Warna kuning untuk highlight */
        box-shadow: 0 0 10px rgba(255, 235, 59, 0.7);
    }
`;
document.head.appendChild(style);

// 2. Show / Hide Operational Monitoring Table
// Membuat tombol untuk menampilkan/menyembunyikan tabel operasional
const toggleTableButton = document.createElement("button");
toggleTableButton.textContent = "Toggle Operational Table";
toggleTableButton.classList.add("btn", "btn-secondary", "mb-4", "ml-4"); // Menambahkan kelas CSS untuk styling

// Kita cari judul H2 yang berisi "Operational Monitoring Table"
const operationalTableTitle = Array.from(document.querySelectorAll("h2")).find(h2 => h2.textContent.includes("Operational Monitoring Table"));
let operationalTable = null;

if (operationalTableTitle) {
    // Kalau judulnya ketemu, kita cari tabel setelah judul itu
    operationalTable = operationalTableTitle.nextElementSibling;
    while(operationalTable && operationalTable.tagName !== "TABLE") {
        operationalTable = operationalTable.nextElementSibling;
    }
}

// Kalau judul dan tabelnya ketemu, baru kita tambahkan tombol
if (operationalTableTitle && operationalTable) {
    operationalTableTitle.parentNode.insertBefore(toggleTableButton, operationalTableTitle.nextElementSibling);
    toggleTableButton.addEventListener("click", () => {
        operationalTable.classList.toggle("hidden"); // Kita pakai class "hidden" untuk sembunyikan/tampilkan tabel
    });
}

// Menambahkan style sederhana untuk menyembunyikan (seharusnya ada di style.css)
const hideStyle = document.createElement("style");
hideStyle.innerHTML = `
    .hidden {
        display: none;
    }
`;
document.head.appendChild(hideStyle);

// --- Task 2: Leaflet & GeoJSON ---

// Inisialisasi peta Leaflet (hanya jika elemen dengan id "mapid" ada di halaman)
if (document.getElementById("mapid")) {
    
    // Basemaps (Peta Dasar)
    // 1. Street Map (OpenStreetMap)
    var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors"
    });

    // 2. Satellite/Imagery Map (Esri Imagery)
    var esriImagery = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
        maxZoom: 19,
        attribution: "Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
    });

    // Membuat objek peta dengan default basemap OSM
    var map = L.map("mapid", {
        layers: [osm] // default layer
    }); 

    // Objek untuk kontrol switch basemap
    var baseMaps = {
        "Satelit (Esri)": esriImagery,
        "Peta Jalan (OSM)": osm
    };

    // Tambahkan kontrol basemap switch di pojok kanan atas peta
    L.control.layers(baseMaps, null, { position: 'topright' }).addTo(map);

    // Kustom Legend masuk di dalam peta (Pojok Kiri Bawah)
    var legendControl = L.control({ position: "bottomleft" });

    legendControl.onAdd = function(map) {
        var div = L.DomUtil.create("div", "legend-in-map");
        div.innerHTML = `
            <h4>Legend</h4>
            <div class="legend-item-inline">
                <span class="legend-color" style="background-color: green;"></span>
                <span>Estate Area (Kebun)</span>
            </div>
            <div class="legend-item-inline">
                <span class="legend-color" style="background-color: red;"></span>
                <span>Road (Jalan)</span>
            </div>
        `;
        return div;
    };
    legendControl.addTo(map);

    // Data GeoJSON Statis yang dimasukkan langsung untuk menangani CORS lokal (CORS bypass ketika dibuka langsung menggunakan file:// di browser)
    const kebunBambangData = {
        "type": "FeatureCollection",
        "name": "Kebun_Bambanng",
        "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
        "features": [
            { "type": "Feature", "properties": { "fid": 1, "id": "1", "nama_area": "kebun_bambang", "luas_area": null, "NAMOBJ": "Kebun Bambang" }, "geometry": { "type": "Polygon", "coordinates": [ [ [ 100.019235133892408, 2.055600814439859 ], [ 100.01926720642787, 2.054082714427902 ], [ 100.017781178951381, 2.054104096118211 ], [ 100.017845324022318, 2.053227446815532 ], [ 100.019491714176127, 2.053184683434913 ], [ 100.020838760665612, 2.053826134144191 ], [ 100.020902905736534, 2.055023508801509 ], [ 100.01967345854375, 2.055472524298003 ], [ 100.019235133892408, 2.055600814439859 ] ] ] } }
        ]
    };

    // Style dan tampilkan data kebun_Bambang
    let kebunBambangLayer = L.geoJSON(kebunBambangData, {
        style: function(feature) {
            return { color: "green", weight: 2, opacity: 0.65 }; // Style untuk kebun (garis hijau)
        },
        onEachFeature: function(feature, layer) {
            if (feature.properties && feature.properties.NAMOBJ) {
                layer.bindPopup(feature.properties.NAMOBJ);
            } else {
                layer.bindPopup("Kebun Bambang");
            }
        }
    }).addTo(map);

    // Mengatur zoom peta agar pas dengan extent kebun_Bambang secara dinamis
    map.fitBounds(kebunBambangLayer.getBounds());

    // Coba memuat data GeoJSON lokal via fetch, jika gagal karena CORS (misal dibuka sebagai file://), 
    // kita gunakan static data fallback agar peta tidak blank dan tidak ada error merah yang mengganggu di console.
    fetch("kebun_Bambanng.geojson")
        .then(response => response.json())
        .then(data => {
            // Jika berhasil via fetch (misal dijalankan di local server), kita bersihkan layer statis dan pasang yang dinamis
            map.removeLayer(kebunBambangLayer);
            kebunBambangLayer = L.geoJSON(data, {
                style: function(feature) {
                    return { color: "green", weight: 2, opacity: 0.65 };
                },
                onEachFeature: function(feature, layer) {
                    layer.bindPopup(feature.properties.NAMOBJ || "Kebun Bambang");
                }
            }).addTo(map);
            map.fitBounds(kebunBambangLayer.getBounds());
        })
        .catch(error => {
            console.log("Membuka via protocol file:// (CORS aktif), menggunakan fallback data Kebun Bambang.");
        });

    // Load jalan_labusel.geojson via fetch dengan penanganan error/CORS fallback agar tidak merusak jalan peta
    fetch("jalan_labusel.geojson")
        .then(response => response.json())
        .then(data => {
            L.geoJSON(data, {
                style: function(feature) {
                    return { color: "red", weight: 1, opacity: 0.8 }; // Style untuk jalan (garis merah tipis)
                },
                onEachFeature: function(feature, layer) {
                    if (feature.properties && feature.properties.NAMOBJ) {
                        layer.bindPopup(feature.properties.NAMOBJ);
                    }
                }
            }).addTo(map);
        })
        .catch(error => {
            console.log("Membuka via protocol file:// (CORS aktif), silakan gunakan ekstensi Live Server untuk visualisasi penuh GeoJSON jalan.");
        });

    // --- Task 3: Integrasi API GeoMAPID ---
    // Memindahkan load data apotek ke sidebar sebelah kanan Map Filter
    const sidebarContainer = document.getElementById("apotek-section-container");
    if (sidebarContainer) {
        sidebarContainer.innerHTML = `
            <section style="padding: 15px; margin-top: 10px; background-color: white; border-radius: 8px;">
                <h2 style="font-size: 16px; margin-bottom: 10px; font-weight: bold; color: #2563EB;">MAPID API Fasilitas Kesehatan</h2>
                <button id="loadApotekData" class="btn btn-primary" style="width: 100%; font-size: 13px; padding: 8px 10px;">Load Data Apotek</button>
                <div id="apotekLoading" class="hidden" style="font-size: 12px; margin-top: 10px;">Sedang memuat data...</div>
                <div id="apotekError" class="hidden" style="color: red; font-size: 12px; margin-top: 10px;"></div>
                <div id="apotekCards" class="mt-4"></div>
                <div id="apotekEmpty" class="hidden" style="font-size: 12px; margin-top: 10px;">Tidak ada data Apotek.</div>
            </section>
        `;

        const loadApotekButton = document.getElementById("loadApotekData");
        const apotekLoading = document.getElementById("apotekLoading");
        const apotekError = document.getElementById("apotekError");
        const apotekCards = document.getElementById("apotekCards");
        const apotekEmpty = document.getElementById("apotekEmpty");

        // Menambahkan event listener untuk tombol "Load Data Apotek"
        loadApotekButton.addEventListener("click", async () => {
            // Menampilkan loading state dan menyembunyikan error/empty/cards sebelumnya
            apotekLoading.classList.remove("hidden");
            apotekError.classList.add("hidden");
            apotekCards.innerHTML = ""; // Mengosongkan kartu Apotek
            apotekEmpty.classList.add("hidden");

            try {
                // Mengambil data dari API GeoMAPID
                const response = await fetch("https://geoserver.mapid.io/layers_new/get_layer?api_key=69dc0445c5e64a8bb646727e8a148aba&layer_id=6a4b7d4d01ac2a33aacd6fde&project_id=6a2c16e76684a940bd1c62ca");
                if (!response.ok) {
                    throw new Error(`Gagal mengambil data dari API! Status: ${response.status}`);
                }
                const data = await response.json(); // Mengubah respons menjadi JSON

                // Memeriksa apakah ada fitur (data Apotek) yang diterima
                if (data.features && data.features.length > 0) {
                    data.features.forEach(feature => {
                        const props = feature.properties; // Properti dari setiap fitur
                        let marker = null;

                        // Menambahkan marker ke peta Leaflet
                        if (feature.geometry && feature.geometry.coordinates) {
                            const [lng, lat] = feature.geometry.coordinates; // Mendapatkan koordinat
                            marker = L.marker([lat, lng])
                                .addTo(map)
                                .bindPopup(`<b>${props.NAMA}</b><br>${props.ALAMAT}`); // Popup marker
                        }

                        // Membuat card kecil untuk sidebar
                        const card = document.createElement("div");
                        card.className = "apotek-card-item";
                        card.innerHTML = `
                            <h4>${props.NAMA}</h4>
                            <p><strong>Alamat:</strong> ${props.ALAMAT}</p>
                            <p><strong>Telepon:</strong> ${props.TELEPON || "-"}</p>
                            <p><strong>Status:</strong> ${props.STATUS || "-"}</p>
                        `;

                        // Saat card di-klik, arahkan/zoom ke peta dan buka popup marker tersebut
                        card.addEventListener("click", () => {
                            if (feature.geometry && feature.geometry.coordinates) {
                                const [lng, lat] = feature.geometry.coordinates;
                                map.setView([lat, lng], 15); // Zoom level 15 ke lokasi apotek
                                if (marker) {
                                    marker.openPopup();
                                }
                            }
                        });

                        apotekCards.appendChild(card);
                    });
                } else {
                    // Jika tidak ada data, tampilkan pesan kosong
                    apotekEmpty.classList.remove("hidden");
                }
            } catch (error) {
                // Menangkap dan menampilkan pesan error jika ada masalah saat fetch data
                console.error("Error memuat data Apotek:", error);
                apotekError.textContent = `Gagal memuat data Apotek: ${error.message}`;
                apotekError.classList.remove("hidden");
            } finally {
                // Menyembunyikan loading state setelah proses selesai
                apotekLoading.classList.add("hidden");
            }
        });
    }
}
