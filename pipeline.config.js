const pipelineConfig = {
    "pipelines": [
        {
            "id": 0,
            "name": "RAG Pipeline",
            "url": "http://localhost:8888/api/1/rest/slsched/feed/snaplogic/projects/shared/RAG%20Task",
            "apiKey": "vH2IPhmHoKVrgHKuRox5KjHTRsMrlEw6"
        },
        {
            "id": 1,
            "name": "Unicorn",
            "url": "http://localhost:8888/api/1/rest/slsched/feed/snaplogic/projects/shared/RAG-unicorn",
            "apiKey": "MDvfGtaZLvbcr7o30YmM7I29nIHcdaa5"
        },
        {
            "id": 2,
            "name": "Coffee",
            "url": "http://localhost:8888/api/1/rest/slsched/feed/snaplogic/projects/shared/RAG-coffee",
            "apiKey": "ayzMXRUH1sElVOekrpmuZztyo9KVWUTb"
        }
    ]
}

module.exports = pipelineConfig;