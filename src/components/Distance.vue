<template>
    <div>
        <div class="px-4 py-3 absolute top-4 right-4">
            <button @click="is_various = !is_various" type="button" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm 
                font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500">
                <span v-if="is_various">One by One</span>
                <span v-else>Multi</span>
            </button>
        </div>
        <div class="flex flex-col justify-center items-center space-y-6 w-full relative">
            
            <h1 class="text-3xl font-semibold text-center">Calculate the distance and time between two locations</h1>

            <form class="flex items-center justify-between space-x-12" @submit.prevent="Generate_Excel" v-if="is_various">

                    <div>
                        <label for="origins" class="block text-sm font-medium text-gray-700"> <i v-if="arr[1]">{{arr[1].length}}</i> Origins </label>
                        <div class="mt-1">
                            <textarea @input="Calculate_lines" v-model="worker.origin" class="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border 
                            border-gray-300 rounded-md" placeholder="Rue Jean Parot, 42100 Saint-Étienne, France"></textarea>
                        </div>
                    </div>

                    <div>
                        <label for="destinations" class="block text-sm font-medium text-gray-700"> <i v-if="arr[2]">{{arr[2].length}}</i>  Destinations </label>
                        <div class="mt-1">
                            <textarea @input="Calculate_lines" v-model="worker.destination" class="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border 
                            border-gray-300 rounded-md" placeholder="Rue de la Métare, 42100 Saint-Étienne, France"></textarea>
                        </div>
                    </div>

            </form>

            <form class="space-y-8 border rounded-md p-12" @submit.prevent="AddToTable" v-else>
                <div class="flex flex-col items-center justify-between space-y-4 w-full">

                    <input type="text" v-model="worker.name" placeholder="Name" class="px-2 py-1 border block w-96 shadow-sm border-gray-300 rounded">

                    <GmapAutocomplete @place_changed="setOrigin" type="text" placeholder="Origin" class="px-2 py-1 border block w-96 shadow-sm border-gray-300 rounded"/>

                    <GmapAutocomplete @place_changed="setDestination" type="text" placeholder="Destination" class="px-2 py-1 border block w-96 shadow-sm border-gray-300 rounded"/>

                </div>

                <div class="border rounded-md p-4">
                    <span class="">Travel Mode:</span>
                    <div class="flex space-x-4 p-4">

                        <div>
                            <label class="inline-flex items-center">
                                <input type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" value="DRIVING" v-model="travel_modes">
                                <span class="ml-2">Car</span>
                            </label>
                        </div>
                        <div>
                            <label class="inline-flex items-center">
                                <input type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" value='BICYCLING' v-model="travel_modes">
                                <span class="ml-2">Bike</span>
                            </label>
                        </div>
                        <div>
                            <label class="inline-flex items-center">
                                <input type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" value='WALKING' v-model="travel_modes">
                                <span class="ml-2">Walking</span>
                            </label>
                        </div>
                        <div>
                            <label class="inline-flex items-center">
                                <input type="checkbox" class="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded" value='TRANSIT' v-model="travel_modes">
                                <span class="ml-2">Transit</span>
                            </label>
                        </div>

                    </div>
                    
                </div>

                <div class="bg-gray-50 text-right">
                    <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white 
                    bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add</button>
                </div>

            </form>

            <table class="min-w-full divide-y divide-gray-200 table-fixed border dark:divide-gray-700 text-center" v-if="!is_various && workers.length > 0">
                <thead class="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        <th class="border-r">Name</th>
                        <th class="border-r">From</th>
                        <th class="border-r">To</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    <tr v-for="(worker, index) in workers" :key="index">
                        <td class="border-r">{{worker.name}}</td>
                        <td class="border-r">{{worker.origin}}</td>
                        <td class="border-r">{{worker.destination}}</td>
                        <td>
                            <button class="inline-block h-4 w-4 rounded-full bg-red-600 text-white text-xs font-semibold" @click="remove_worker(index)">X</button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button @click="Generate_Excel" type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm 
                font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                    Generate Excel
                </button>
            </div>

            <export-excel
                v-if="file_ready"
                :data = "json_data"
                class="flex items-center p-4 cursor-pointer font-medium rounded-md text-white bg-blue-600"
                >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>

                Download File with {{dt.length}} rows
            </export-excel>

        </div>
    </div>
</template>

<script>
import {gmapApi} from 'vue2-google-maps';
export default {
    name: 'Distance',
    data(){
        return{
            worker: {name: '', origin: '', destination: ''},
            workers:[],
            travel_modes: ["DRIVING", "BICYCLING"],

            file_ready: false,

            json_data: [],
            json_meta: [
                [
                    {
                        'key': 'charset',
                        'value': 'utf-8'
                    }
                ]
            ],

            is_various: false,
            delayFactor: 0,
            dt: [],
            arr: []
        }
    },
    computed: {
        google: gmapApi
    },
    methods:{
        AddToTable(){
            if(this.worker.name === "" || this.worker.origin === "" || this.worker.destination === "") return
            this.workers.push({name: this.worker.name, origin: this.worker.origin, destination: this.worker.destination});
        },
        remove_worker(worker_index){
            this.workers = this.workers.filter((w, key) => key !== worker_index);
        },
        setOrigin(place) {
            this.worker.origin = place.formatted_address;
        },
        setDestination(place) {
            this.worker.destination = place.formatted_address;
        },
        Calculate_lines(){
            let arr = [];

            for (const [key, value] of Object.entries(this.worker)) {
                key;
                let v = value.split("\n");
                // To ignore NaN, Undefiend, boolean values or empty object
                arr.push((v.filter(Boolean)));
            }

            this.arr = arr;
        },
        async Generate_Excel(){
            var request = {};

            var _this = this;
            _this.file_ready = false;

            if(this.is_various){

                let origins = _this.arr[1];
                let destinations = _this.arr[2];

                for (let i = 0; i < origins.length; i++) {

                    if(origins[i] === undefined || destinations[i] === undefined) return
                    
                    for (const mode of _this.travel_modes) {
                        request =  {
                            origin: origins[i].trim(),
                            destination: destinations[i].trim(),
                            travelMode: mode, //WALKING, BYCYCLING, TRANSIT
                            unitSystem: this.google.maps.UnitSystem.IMPERIAL,
                        }

                        // pass the request to the route method
                        await _this.get_directions_route(request, mode);
                    }

                    _this.file_ready = true;
                    
                }

            }else{

                if(this.workers.length <= 0 || this.travel_modes.length <= 0 ) return

                for (const worker of _this.workers) {
                    for (const mode of _this.travel_modes) {
                        // create request
                        request = {
                            origin: worker.origin.trim(),
                            destination: worker.destination.trim(),
                            travelMode: mode, //WALKING, BYCYCLING, TRANSIT
                            unitSystem: this.google.maps.UnitSystem.IMPERIAL,
                        }

                        // pass the request to the route method
                        await _this.get_directions_route(request, mode, worker.name);
                    }

                    _this.file_ready = true;
                }
            }
            _this.json_data = _this.dt;
        },
        async get_directions_route(request, mode, name=""){
            var _this = this;
            var directionsService = new _this.google.maps.DirectionsService();

            try {
                await directionsService.route(request, function (result, status) {
                    if(status === "OK"){
                        console.log(request)
                        // Convert distance to km
                        let distance_in_kilimoters = parseInt(result.routes[0].legs[0].distance.text) * 1.6;

                        _this.dt.push({
                            Name: name, 
                            Origin: request.origin, 
                            Destination: request.destination,
                            Distance: (Math.round(distance_in_kilimoters * 100) / 100).toFixed(1) + " Kilometers",
                            Duration: result.routes[0].legs[0].duration.text,
                            Mode: mode
                        });
                    }else if (status === "OVER_QUERY_LIMIT") {
                        _this.delayFactor++;
                        setTimeout(function () {
                            _this.get_directions_route(request, mode);
                            return
                        }, _this.delayFactor * 1000);
                    } 
                    else{
                        // console.log(status + " of "+ worker.name +"!\nPlease choose others locations");
                    }
                });
            } catch (error) {
                console.log(error.message);
            }
        }
    }
}
</script>

<style scoped>
textarea {
  width: 500px;
  height: 300px;
}
</style>