const pipelineConfig = {
    "pipelines": [
        {
            "id": 0,
            "name": "Acme Sales",
            "url": "http://localhost:8888/api/1/rest/slsched/feed/snaplogic/projects/shared/RAG%20Task",
            "apiKey": "CFvuIwc0g6wGFbpyUR5Z645T9SfYoWPu"
        },
        {
            "id": 1,
            "name": "canary pipeline",
            "url": "https://canary.elastic.snaplogicdev.com/api/1/rest/slsched/feed/snaplogic/DynamicValidationProjectSpace/shared/snap-gpt%20prompt%20RAG%20Task",
            "apiKey": "PkS12OubyCQvDJYiFjfbQE0YMVQMg8UW"
        },
    ]
}

module.exports = pipelineConfig;