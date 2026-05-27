import yaml from 'js-yaml'

import type { CountryGroup, NodeInfo } from '@/services/auth'

interface ClashProxy {
  name: string
  type: string
  server: string
  port: number
  cipher: string
  password: string
  obfs?: string
  'obfs-param'?: string
  protocol?: string
  'protocol-param'?: string
}

interface ClashProxyGroup {
  name: string
  type: string
  proxies: string[]
}

export function convertToClashYaml(countries: CountryGroup[]): string {
  const proxies: ClashProxy[] = []
  const proxyGroups: ClashProxyGroup[] = []

  for (const country of countries) {
    const groupName = `${country.country_name} (${country.country_code})`
    const nodeNames: string[] = []

    for (const node of country.nodes) {
      const proxy = createProxy(node)
      proxies.push(proxy)
      nodeNames.push(node.name)
    }

    proxyGroups.push({
      name: groupName,
      type: 'select',
      proxies: nodeNames,
    })
  }

  const allGroupNames = proxyGroups.map((g) => g.name)
  proxyGroups.unshift({
    name: 'GLOBAL',
    type: 'select',
    proxies: ['DIRECT', 'REJECT', ...allGroupNames],
  })

  return yaml.dump({ proxies, 'proxy-groups': proxyGroups }, { indent: 2 })
}

function createProxy(node: NodeInfo): ClashProxy {
  const proxy: ClashProxy = {
    name: node.name,
    type: 'ss',
    server: node.server,
    port: Number(node.server_port),
    cipher: node.method,
    password: node.password,
  }

  if (node.obfs && node.obfs !== 'none') {
    proxy.obfs = node.obfs
    if (node.obfsparam) proxy['obfs-param'] = node.obfsparam
  }

  if (node.protocol && node.protocol !== 'origin') {
    proxy.protocol = node.protocol
    if (node.protocolparam) proxy['protocol-param'] = node.protocolparam
  }

  return proxy
}
