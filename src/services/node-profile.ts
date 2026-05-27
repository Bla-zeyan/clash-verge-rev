import { auth, CountryGroup } from '@/services/auth'
import { createProfile, patchProfile } from '@/services/cmds'
import { convertToClashYaml } from '@/utils/node-converter'

const AUTH_PROFILE_PREFIX = 'auth_profile_'

export interface LoginWithNodesResult {
  success: boolean
  profileId?: string
  message?: string
}

export async function loginAndLoadNodes(
  username: string,
  password: string,
): Promise<LoginWithNodesResult> {
  const loginRes = await auth.login({ username, password })

  if (loginRes.status !== 'success') {
    return { success: false, message: loginRes.message }
  }

  auth.saveUserId(loginRes.data.id)

  const nodeListRes = await auth.getNodeList(loginRes.data.id)

  if (
    nodeListRes.status !== 'success' ||
    !nodeListRes.data ||
    nodeListRes.data.length === 0
  ) {
    return {
      success: true,
      profileId: undefined,
      message:
        nodeListRes.status === 'fail' ? '获取节点列表失败' : '暂无可用节点',
    }
  }

  const yamlContent = convertToClashYaml(nodeListRes.data)

  const timestamp = Date.now()
  const profileName = `我的节点列表-${timestamp}`

  const profileId = await createAuthProfile(profileName, yamlContent)

  return { success: true, profileId }
}

export async function createAuthProfile(
  name: string,
  yamlContent: string,
): Promise<string> {
  const profileUid = `${AUTH_PROFILE_PREFIX}${Date.now()}`

  await createProfile(
    {
      uid: profileUid,
      type: 'local',
      name: name,
      desc: '用户登录后自动导入的节点列表',
    },
    yamlContent,
  )

  await patchProfile(profileUid, {
    selected: [{ name: 'GLOBAL', now: 'GLOBAL' }],
  })

  return profileUid
}

export async function deleteAuthProfiles(): Promise<void> {
  const { getProfiles } = await import('@/services/cmds')
  const profilesConfig = await getProfiles()

  if (!profilesConfig.items) return

  const authProfiles = profilesConfig.items.filter((item) =>
    item.uid.startsWith(AUTH_PROFILE_PREFIX),
  )

  const { deleteProfile } = await import('@/services/cmds')

  for (const profile of authProfiles) {
    await deleteProfile(profile.uid)
  }
}

export async function getAuthProfileIds(): Promise<string[]> {
  const { getProfiles } = await import('@/services/cmds')
  const profilesConfig = await getProfiles()

  if (!profilesConfig.items) return []

  return profilesConfig.items
    .filter((item) => item.uid.startsWith(AUTH_PROFILE_PREFIX))
    .map((item) => item.uid)
}

export async function switchToAuthProfile(): Promise<boolean> {
  const profileIds = await getAuthProfileIds()

  if (profileIds.length === 0) return false

  const latestProfileId = profileIds.sort().pop()!

  const { patchProfilesConfig, getProfiles } = await import('@/services/cmds')
  const profilesConfig = await getProfiles()

  const updatedItems = profilesConfig.items?.map((item) => {
    if (item.uid === latestProfileId) {
      return { ...item, enable: true }
    }
    return item
  })

  if (updatedItems) {
    await patchProfilesConfig({
      ...profilesConfig,
      items: updatedItems,
      current: latestProfileId,
    })
  }

  return true
}
