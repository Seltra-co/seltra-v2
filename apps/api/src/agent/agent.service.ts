import { Injectable } from '@nestjs/common'
import { generateBlueprint } from '@seltra/ai'

@Injectable()
export class AgentService {
  async buildStore(prompt: string) {
    const blueprint = await generateBlueprint(prompt)
    
    if (!blueprint.success) {
      throw new Error(blueprint.error ?? 'Unknown error')
    }
    
    return {
      success: true,
      provider: blueprint.provider,
      data: blueprint.data,
    }
  }
}