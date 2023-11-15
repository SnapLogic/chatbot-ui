const pipelineConfig = {
    "pipelines": [
        {
            "id": 0,
            "name": "RAG Pipeline",
            "url": "http://localhost:8888/api/1/rest/slsched/feed/snaplogic/projects/shared/RAG%20Task"
        },
        {
            "id": 1,
            "name": "Unicorn",
            "url": "http://localhost:8888/api/1/rest/slsched/feed/snaplogic/projects/shared/RAG-unicorn"
        },
        {
            "id": 2,
            "name": "Coffee",
            "url": "http://localhost:8888/api/1/rest/slsched/feed/snaplogic/projects/shared/RAG-coffee"
        }
    ]
}

module.exports = pipelineConfig;