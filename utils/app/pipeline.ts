import { Pipeline } from '@/types/pipeline';

const STORAGE_KEY = 'pipeline';

export const getPipeline = (): Pipeline => {
  let pipeline: Pipeline = {
    endpoint: '',
    bearerToken:''
  };
  const settingsJson = localStorage.getItem(STORAGE_KEY);
  if (settingsJson) {
    try {
      let savedSettings = JSON.parse(settingsJson) as Pipeline;
      pipeline = Object.assign(pipeline, savedSettings);
    } catch (e) {
      console.error(e);
    }
  }
  return pipeline;
};

export const savePipeline = (settings: Pipeline) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};