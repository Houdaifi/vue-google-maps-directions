<template>
    <div class="flex flex-col justify-center items-center space-y-6 w-full">
        <!-- <h1 class="text-4xl font-bold">F5atar ahssan chrikti</h1> -->
        <h1 class="text-3xl font-semibold">Hope this will be useful</h1>

        <form class="space-y-8" @submit.prevent="AddToTable">
            <div class="">
                <input type="text" v-model="worker.name" placeholder="Name" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm border-gray-300 rounded-md">
            </div>

            <div class="">
                <GmapAutocomplete @place_changed="setOrigin" type="text" placeholder="Origin" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm border-gray-300 rounded-md"/>
            </div>

            <div class="">
                <GmapAutocomplete @place_changed="setDestination" type="text" placeholder="Destination" class="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm border-gray-300 rounded-md"/>
            </div>

            <div class="mt-4">
                <span class="text-gray-700">Travel Mode</span>
                <div class="mt-2">
                    <label class="inline-flex items-center">
                        <input type="radio" class="form-radio" name="accountType" value="DRIVING" v-model="worker.travel_mode">
                        <span class="ml-2">CAR</span>
                    </label>
                    <label class="inline-flex items-center ml-6">
                        <input type="radio" class="form-radio" name="accountType" value="BICYCLING" v-model="worker.travel_mode">
                        <span class="ml-2">Bike</span>
                    </label>
                    <label class="inline-flex items-center ml-6">
                        <input type="radio" class="form-radio" name="accountType" value="WALKING" v-model="worker.travel_mode">
                        <span class="ml-2">11</span>
                    </label>
                    <label class="inline-flex items-center ml-6">
                        <input type="radio" class="form-radio" name="accountType" value="TRANSIT" v-model="worker.travel_mode">
                        <span class="ml-2">TRANSIT</span>
                    </label>
                </div>
            </div>

            <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
                <button type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Add</button>
            </div>

        </form>

        <table class="min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-700 text-center">
            <thead class="bg-gray-100 dark:bg-gray-700">
                <tr>
                    <th>Name</th>
                    <th>From</th>
                    <th>To</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                <tr v-for="(worker, index) in workers" :key="index">
                    <td>{{worker.name}}</td>
                    <td>{{worker.origin.name}}</td>
                    <td>{{worker.destination.name}}</td>
                    <td>
                        <button class="text-red-500" @click="remove_worker(index)">x</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <div class="px-4 py-3 bg-gray-50 text-right sm:px-6">
            <button @click="Generate_Excel" type="submit" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Generate Excel
            </button>
        </div>

        <export-excel
            v-if="file_ready"
            :data   = "json_data">
            Download Data
            <img src="download_icon.png">
        </export-excel>

    </div>
</template>

<script>
import {gmapApi} from 'vue2-google-maps';
export default {
    name: 'Distance',
    data(){
        return{
            worker: {name: '', origin: '', destination: '', duration: '', travel_mode: ''},
            workers:[],
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
        }
    },
    computed: {
        google: gmapApi
    },
    methods:{
        AddToTable(){
            if(this.worker.name === "" || this.worker.origin === "" || this.worker.destination === "" || this.worker.travel_mode === "") return
            this.workers.push({name: this.worker.name, origin: this.worker.origin, destination: this.worker.destination, duration: this.worker.duration, travel_mode: this.worker.travel_mode});
        },
        remove_worker(worker_index){
            this.workers = this.workers.filter((w, key) => key !== worker_index);
        },
        setOrigin(place) {
            this.worker.origin = place;
        },
        setDestination(place) {
            this.worker.destination = place;
        },
        Generate_Excel(){
            var _this = this;

            if(this.workers.length <= 0) return

            var directionsService = new this.google.maps.DirectionsService();

            var request = {};
            var dt = [];

            _this.workers.forEach(worker => {
                //create request
                request = {
                    origin: worker.origin.name,
                    destination: worker.destination.name,
                    travelMode: worker.travel_mode, //WALKING, BYCYCLING, TRANSIT
                    unitSystem: this.google.maps.UnitSystem.IMPERIAL
                }

                // // pass the request to the route method
                directionsService.route(request, function (result, status) {
                    if(status === "OK"){

                        dt.push({Name: worker.name, Origin: worker.origin.name, 
                                Destination: worker.destination.name,
                                Distance: result.routes[0].legs[0].distance.text,
                                Duration: result.routes[0].legs[0].duration.text,
                                Mode: worker.travel_mode});

                        _this.file_ready = true;
                    }else{
                        alert(status + " of "+ worker.name +"!\nPlease choose others locations");
                    }
                });

            });

            _this.json_data = dt;
        },
    }
}
</script>