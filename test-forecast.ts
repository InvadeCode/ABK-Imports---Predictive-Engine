async function run() {
    let res = await fetch('http://localhost:3000/api/forecast/skus');
    let json = await res.json();
    console.log(json.data[0]);
    console.log(json.aggregate);
}
run();
